// components/xing-editor.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //图片上传相关属性，参考wx.uploadFile
    imageUploadUrl: String,
    imageUploadName: String,
    imageUploadHeader: Object,
    imageUploadFormData: Object,
    imageUploadKeyChain: String, //例：'image.url'

    //是否在选择图片后立即上传
    // uploadImageWhenChoose: {
    //   type: Boolean,
    //   value: false,
    // },

    //输入内容
    nodes: Array,
    html: String,

    //内容输出格式，参考rich-text组件，默认为节点列表
    outputType: {
      type: String,
      value: 'array',
    },

    buttonBackgroundColor: {
      type: String,
      value: '#409EFF',
    },

    buttonTextColor: {
      type: String,
      value: '#fff',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    windowHeight: 0,
    titleNode: {
      name: 'h',
      attrs: {
        class: 'xing-h',
      },
      children: [{
        type: 'text',
        text: '',
      }]
    },
    anstract: '',
    nodeList: [],
    titleBuffer: '',
    textBufferPool: [],
    currentIndex: 0,
    count:0
  },

  /*attached: function () {
    const { windowHeight } = wx.getSystemInfoSync();
    this.setData({
      windowHeight,
    })
    if (this.properties.nodes && this.properties.nodes.length > 0) {
      const textBufferPool = [];
      this.properties.nodes.forEach((node, index) => {
        if (node.name === 'p') {
          textBufferPool[index] = node.children[0].text;
        }
      })
      this.setData({
        textBufferPool,
        nodeList: this.properties.nodes,
      })
    } else if (this.properties.html) {
      const nodeList = this.HTMLtoNodeList();
      const textBufferPool = [];
      nodeList.forEach((node, index) => {
        if (node.name === 'p') {
          textBufferPool[index] = node.children[0].text;
        }
      })
      this.setData({
        textBufferPool,
        nodeList,
      })
    }
  },*/

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 事件：添加文本
     */
    addText: function (e) {
      this.writeTextToNode();
      let index = this.data.currentIndex;
      const node = {
        name: 'p',
        attrs: {
          class: 'xing-p',
        },
        children: [{
          type: 'text',
          text: ''
        }]
      }
      const nodeList = this.data.nodeList;
      const textBufferPool = this.data.textBufferPool;
      //console.log(textBufferPool)
      nodeList.splice(index + 1, 0, node);
      textBufferPool.splice(index + 1, 0, '');
      index = index + 1;
      this.setData({
        nodeList,
        textBufferPool,
        currentIndex: index,
      });
    },

    /**
     * 事件：添加图片
     */
    addImage: function (e) {
      this.writeTextToNode();
      let index = this.data.currentIndex;
      wx.chooseImage({
        success: resp => {
          console.log(resp);
          const tempFilePath = resp.tempFilePaths[0];
          wx.getImageInfo({
            src: tempFilePath,
            success: res => {
              const node = {
                name: 'img',
                attrs: {
                  class: 'xing-img',
                  style: 'width: 100%',
                  src: tempFilePath,
                  _height: res.height / res.width,
                },
              }
              let nodeList = this.data.nodeList;
              let textBufferPool = this.data.textBufferPool;
              nodeList.splice(index + 1, 0, node);
              textBufferPool.splice(index + 1, 0, tempFilePath);
              index = index + 1;
              this.setData({
                nodeList,
                textBufferPool,
                currentIndex: index,
              })
            }
          })
        },
      })
    },

    /**
     * 事件：删除节点
     */
    deleteNode: function (e) {
      this.writeTextToNode();
      const index = e.currentTarget.dataset.index;
      let curIndex = this.data.currentIndex;
      let nodeList = this.data.nodeList;
      let textBufferPool = this.data.textBufferPool;
      nodeList.splice(index, 1);
      textBufferPool.splice(index, 1);
      this.setData({
        nodeList,
        textBufferPool,
        currentIndex: curIndex - 1,
      });
    },

    /**
     * 事件：标题输入
     */
    onTitleInput: function (e) {
      let titleBuffer = this.data.titleBuffer;
      titleBuffer = e.detail.value;
      this.setData({
        titleBuffer,
      })
    },

    /**
     * 事件：文本输入
     */
    onTextareaInput: function (e) {
      const index = e.currentTarget.dataset.index;
      let textBufferPool = this.data.textBufferPool;
      textBufferPool[index] = e.detail.value;
      this.setData({
        textBufferPool,
      })
    },

    /**
     * 事件：存储摘要
     */
    setAbstract: function (e){
      var i = 0;
      const nodeList = this.data.nodeList
      while (nodeList[i].name === 'p'){
        this.setData({
          abstract: nodeList[i].children[0].text.slice(0,20),
        });
        return;
      }
      this.setData({
        abstract: "[图片]",
      })
    },

    /**
     * 事件：提交内容
     */
    onFinish: function (e) {
      wx.showLoading({
        title: '正在保存',
      })
      this.writeTextToNode();
      this.setAbstract();
      this.handleOutput();
    },

    /**
     * 方法：HTML转义
     */
    htmlEncode: function (str) {
      var s = "";
      if (str.length == 0) return "";
      s = str.replace(/&/g, "&gt;");
      s = s.replace(/</g, "&lt;");
      s = s.replace(/>/g, "&gt;");
      s = s.replace(/ /g, "&nbsp;");
      s = s.replace(/\'/g, "&#39;");
      s = s.replace(/\"/g, "&quot;");
      s = s.replace(/\n/g, "<br>");
      return s;
    },

    /**
     * 方法：HTML转义
     */
    htmlDecode: function (str) {
      var s = "";
      if(str.length == 0) return "";
      s = str.replace(/&gt;/g, "&");
      s = s.replace(/&lt;/g, "<");
      s = s.replace(/&gt;/g, ">");
      s = s.replace(/&nbsp;/g, " ");
      s = s.replace(/&#39;/g, "\'");
      s = s.replace(/&quot;/g, "\"");
      s = s.replace(/<br>/g, "\n");
      return s;
    },

    /**
     * 方法：将缓冲池的文本写入节点
     */
    writeTextToNode: function (e) {
      const titleBuffer = this.data.titleBuffer;
      const textBufferPool = this.data.textBufferPool;
      const titleNode = this.data.titleNode
      const nodeList = this.data.nodeList;
      titleNode.children[0].text = titleBuffer;
      nodeList.forEach((node, index) => {
        if (node.name === 'p') {
          node.children[0].text = textBufferPool[index];
        }
      })
      this.setData({
        titleNode,
        nodeList,
      })
    },

    /**
     * 方法：将HTML转为节点
     */
    HTMLtoNodeList: function () {
      let html = this.properties.html;
      let htmlNodeList = [];
      while (html.length > 0) {
        const endTag = html.match(/<\/[a-z0-9]+>/);
        if (!endTag) break;
        const htmlNode = html.substring(0, endTag.index + endTag[0].length);
        htmlNodeList.push(htmlNode);
        html = html.substring(endTag.index + endTag[0].length);
      }
      return htmlNodeList.map(htmlNode => {
        let node = {attrs: {}};
        const startTag = htmlNode.match(/<[^<>]+>/);
        const startTagStr = startTag[0].substring(1, startTag[0].length - 1).trim();
        node.name = startTagStr.split(/\s+/)[0];
        startTagStr.match(/[^\s]+="[^"]+"/g).forEach(attr => {
          const [name, value] = attr.split('=');
          node.attrs[name] = value.replace(/"/g, '');
        })
        if (node.name === 'p') {
          const endTag = htmlNode.match(/<\/[a-z0-9]+>/);
          const text = this.htmlDecode(htmlNode.substring(startTag.index + startTag[0].length, endTag.index).trim());
          node.children = [{
            text,
            type: 'text',
          }]
        }
        return node;
      })
    },

    /**
     * 方法：将节点转为HTML
     */
    nodeListToHTML: function () {
      return this.data.nodeList.map(node => `<${node.name} ${Object.keys(node.attrs).map(key => `${key}="${node.attrs[key]}"`).join(' ')}>${node.children ? this.htmlEncode(node.children[0].text) : ''}</${node.name}>`).join('');
    },

    /**
     * 方法：上传图片
     */
    uploadImage: function (node) {
      console.log(node.attrs.src)
      return new Promise((resolve,reject)=>{
        let tmpUrl = node.attrs.src;
        let userid = app.globalData.userid;
        let count = this.data.count;
        var name = (new Date()).getTime() + '-' + count;
        this.setData({count:++count})
        console.log(name)
        wx.cloud.uploadFile({
          //cloudPath: 'example',
          cloudPath: "post/" + userid + '/' + name,
          filePath: tmpUrl
        }).then(resp => {
          console.log(resp);
          node.attrs.src = resp.fileID;
          resolve(resp.fileID);
        },err => {
          console.log(err);reject(err);
        })
      })

      /*
      return new Promise(resolve => {
        let options = {
          filePath: node.attrs.src,
          url: this.properties.imageUploadUrl,
          name: this.properties.imageUploadName,
        }
        if (this.properties.imageUploadHeader) {
          options.header = this.properties.imageUploadHeader;
        }
        if (this.properties.imageUploadFormData) {
          options.formData = this.properties.imageUploadFormData;
        }
        options.success = res => {
          const keyChain = this.properties.imageUploadKeyChain.split('.');
          let url = JSON.parse(res.data);
          keyChain.forEach(key => {
            url = url[key];
          })
          node.attrs.src = url;
          node.attrs._uploaded = true;
          resolve();
        }
        wx.uploadFile(options);
      })
      */
    },

    /**
     * 方法：处理节点，递归
     */
    handleOutput: function (index = 0) {
      let nodeList = this.data.nodeList;
      if (index >= nodeList.length) {
        wx.hideLoading();
        console.log(nodeList);
        this.triggerEvent('create',{
          abstract: this.data.abstract,
          content: nodeList.map(n=>{
            if(n.name === 'img')return {img:true,fileid:n.attrs.src};
            else return {img:false,text:n.children[0].text};
          }),
          title: this.data.titleBuffer
        });
        /*
        if (this.properties.outputType.toLowerCase() === 'array') {
          console.log('this.data');
          this.triggerEvent('finish', { content: this.data.nodeList });
        }
        if (this.properties.outputType.toLowerCase() === 'html') {
          this.triggerEvent('finish', { 
            title: this.properties.titleNode,
            content: this.nodeListToHTML() });
        }
        */
        return;
      }
      const node = nodeList[index];
      if (node.name === 'img' && !node.attrs._uploaded) {
        this.uploadImage(node).then(() => {
          this.handleOutput(index + 1)
        });
      } else {
        this.handleOutput(index + 1);
      }
    },
  }
})
