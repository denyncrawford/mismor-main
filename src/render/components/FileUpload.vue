<template>
  <div class="grid grid-cols-3 gap-4">
    <transition-group name="slide-down">
      <div
        @mouseenter="file.showActions = true"
        @mouseleave="file.showActions = false"
        v-for="file in assets"
        :style="{
          'background-image': 'url(' + getFileUrl(file) + ')',
        }"
        :key="file.uid"
        class="
          w-32
          h-32
          cursor-pointer
          rounded
          border
          bg-cover bg-center bg-no-repeat
          border-gray-400 border-dashed
          flex
          items-center
          justify-center
          relative
          overflow-hidden
        "
      >
        <div
          v-show="file.showActions && !file.isUploading"
          class="
            flex
            items-center
            justify-center
            w-full
            h-full
            bg-opacity-50 bg-gray-900
            transition
            absolute
            top-0
            left-0
          "
        >
          <div class="flex">
            <EyeIcon
              @click="openFile(file)"
              class="hover:text-blue-700 w-5 h-5 mx-2 text-white"
            />
            <FolderIcon
              @click="openFolder(file)"
              class="hover:text-blue-700 w-5 h-5 mx-2 text-white"
            />
            <TrashIcon
              @click="deleteFile(file)"
              class="hover:text-blue-700 w-5 h-5 mx-2 text-white"
            />
          </div>
        </div>
        <div
          v-show="file.isUploading"
          class="
            flex
            items-center
            justify-center
            w-full
            h-full
            transition
            bg-opacity-10 bg-gray-900
            absolute
            top-0
            left-0
          "
        >
          <div class="flex">
            <div class="dot-falling"></div>
          </div>
        </div>
      </div>
    </transition-group>
    <div
      @click="selectFile"
      class="
        w-32
        h-32
        cursor-pointer
        hover:border-blue-700
        rounded
        border border-gray-400 border-dashed
        flex
        items-center
        justify-center
      "
    >
      <PlusIcon class="w-5 h-5" />
    </div>
  </div>
</template>

<script>
const fs = require("fs");
const { join, basename } = require("path");
const { promisify } = require("util");
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const { app, dialog } = require("electron").remote;
const programFolder = app.getPath("userData");
const dataFolder = join(programFolder, "/data");
import { UltimateTextToImage as TextToImage} from "ultimate-text-to-image";
import { mapState } from "vuex";
import { nanoid } from "nanoid";
import {
  PlusIcon,
  FolderIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/vue/outline";

export default {
  computed: {
    ...mapState(["dataNode"]),
    getFileUrl() {
      return (file) => {
        const imageExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "webp",
          "svg",
        ];
        if (!imageExtensions.includes(file.ext))
         return new TextToImage(file.ext.toUpperCase(), {
            customHeight: 3000,
            maxWidth: 3000,
            width: 3000,
            height: 3000,
            fontSize: 700,
            align: "center",
            valign: "middle",
          }).render().toDataUrl();
        if (!file.path) return "";
        return `http://localhost:8080/ipfs/${file.path}`;
      };
    },
  },
  props: ["assets", "deletedAssets"],
  methods: {
    async selectFile() {
      let file = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "Images",
            extensions: ["jpg", "png", "pdf", "ai", "psd", "wep", "svg"],
          },
        ],
      });
      const { filePaths } = file;
      await Promise.all(
        filePaths.map(async (path) => {
          const filepath = `/${basename(path)}`;
          const stream = fs.createReadStream(path);
          const uid = nanoid();
          this.assets.push({
            path: null,
            ext: path.split(".").pop(),
            filename: basename(path),
            uid,
            showActions: false,
            isUploading: true,
          });
          await this.dataNode.files.write(filepath, stream, {
            create: true,
          });
          const {
            cid: { string: fileCid },
          } = await this.dataNode.files.stat(filepath);
          const file = this.assets.findIndex((file) => file.uid === uid);
          this.assets[file].path = fileCid;
          this.assets[file].isUploading = false;
        })
      );
    },
    async openFile(file) {
      file.isUploading = true;
      const joined = await this.ensureFile(file);
      require("child_process").exec(`start ${joined}`);
      file.isUploading = false;
    },
    async openFolder(file) {
      file.isUploading = true;
      const joined = await this.ensureFile(file);
      require("child_process").exec(`explorer.exe /select,${joined}`);
      file.isUploading = false;
    },
    async ensureFile(file) {
      const filename = `${file.path}.${file.ext}`;
      const joined = join(dataFolder, filename);
      if (!(await exists(joined))) {
        const fStream = fs.createWriteStream(joined);
        for await (const chunk of this.dataNode.cat(file.path)) {
          fStream.write(chunk);
        }
        fStream.end();
      }
      return joined;
    },
    async deleteFile(file) {
      file.isUploading = true;
      const joined = join(dataFolder, `${file.path}.${file.ext}`);
      this.deletedAssets.push(file);
      if (await exists(joined)) await unlink(joined);
      try {
        await this.dataNode.files.rm(`/${file.filename}`);
      } catch (e) {
        console.log("File doesn't exists on this node.");
      }
      const index = this.assets.findIndex((e) => e.uid === file.uid);
      if (index > -1) {
        this.assets.splice(index, 1);
      }
    },
  },
  async mounted() {
    if (!(await exists(dataFolder))) {
      await mkdir(dataFolder);
    }
  },
  components: {
    PlusIcon,
    FolderIcon,
    EyeIcon,
    TrashIcon,
  },
};
</script>
