<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-select v-model="listQuery.position" placeholder="请选择位置" @change="getList">
        <el-option :value="-1" label="全部"/>
        <el-option v-for="(item,index) in positionChinese" :label="item" :key="index+1" :value="index+1"/>
      </el-select>
      <el-select v-model="listQuery.enabled" placeholder="请选择"  @change="getList">
        <el-option :value="null" label="全部"/>
        <el-option :value="1" label="启用"/>
        <el-option :value="0" label="不启用"/>
      </el-select>
      <el-button v-permission="['POST /admin/ad/create']" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate" style="margin-bottom: 0px">添加</el-button>
      <!--<el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload" style="margin-bottom: 0px">导出</el-button>-->
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row >

      <el-table-column align="center" label="位置" prop="position" >
        <template slot-scope="scope">
          <el-tag >{{ positionChinese[scope.row.position-1] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="图片" prop="url"  >
        <template slot-scope="scope">
          <img  :src="scope.row.urlList[0]" width="80" v-if="scope.row.position == 1">
          <el-tag v-if="scope.row.position!=1">无</el-tag>
        </template>
      </el-table-column>


      <el-table-column align="center" label="跳转商品" prop="link">
        <template slot-scope="scope">
          <el-tag :type="scope.row.position != 1 ? 'success' : 'error' ">{{ scope.row.position != 1  ? scope.row.link : '无' }}</el-tag>
        </template>
      </el-table-column>


      <el-table-column align="center" label="介绍" prop="url">
        <template slot-scope="scope">
          <el-tag type="error" v-if="scope.row.position == 1 || scope.row.name == '热门水果'">{{'无'}}</el-tag>
          <el-tag v-if="scope.row.name == '新品上市' || scope.row.name == '特价水果'" v-for="(item,index) in scope.row.urlList">{{ scope.row.linkList[index]+':'+item}}</el-tag>
        </template>
      </el-table-column>


      <el-table-column align="center" label="是否启用" prop="enabled">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled ? 'success' : 'error' ">{{ scope.row.enabled ? '启用' : '不启用' }}</el-tag>
        </template>
      </el-table-column>


      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/ad/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/ad/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="closeFrom">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item label="图片位置" prop="position">
          <el-select v-model="dataForm.position" placeholder="请选择" @change="changeName">
            <el-option v-for="(item,index) in positionChinese" :label="item" :key="index+1"  :value="index+1"/>
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="name" v-if="dataForm.position != 1">
          <el-select v-model="dataForm.name" placeholder="请选择" @change="changeName" :disabled="true">
            <el-option value="新品上市" label="新品上市"/>
            <el-option value="热门水果" label="热门水果"/>
            <el-option value="特价水果" label="特价水果"/>
          </el-select>
        </el-form-item>


        <el-form-item  label="图片" prop="urlList" v-if="dataForm.position == 1">
          <el-button icon="el-icon-tickets" type="primary" @click="showImage()" >设置</el-button>
        </el-form-item>


        <el-form-item  label="展示商品" prop="link" v-if="dataForm.position != 1">
          <el-tag closable :key="item" v-for="item in dataForm.linkList" @close="closeGoods(item)">{{item}}</el-tag>
          <el-button icon="el-icon-tickets" type="primary" @click="showGoodsTable(dataForm.name)" >设置</el-button>
        </el-form-item>

        <el-form-item label="页面展示图片"  prop="content" v-if="dataForm.position != 1 ">
          <el-upload
            class="avatar-uploader"
            :action="uploadPath"
            :headers="headers"
            :show-file-list="false"
            :on-success="submitSuccess1"
            :before-upload="beforeAvatarUpload">
            <img v-if="dataForm.content" :src="dataForm.content" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <p style="color: red;">图片最佳尺寸为375px*220px</p>
        </el-form-item>


        <el-form-item   prop="content"  :label="item+'介绍'"  v-if="dataForm.position != 1 && (dataForm.name == '新品上市' || dataForm.name == '特价水果')" v-for="(item,index) in dataForm.linkList">
          <el-input v-model="dataForm.urlList[index]" @input="$forceUpdate()"/>
        </el-form-item>





        <el-form-item label="是否启用" prop="enabled">
          <el-select v-model="dataForm.enabled" placeholder="请选择">
            <el-option :value="true" label="启用"/>
            <el-option :value="false" label="不启用"/>
          </el-select>
        </el-form-item>




      </el-form>


      <div slot="footer" class="dialog-footer">
        <el-button @click="closeFrom">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>



    <el-dialog title="图片设置" :visible.sync="slideshowVisible" >
      <el-carousel indicator-position="outside" trigger="click" v-if="fileList.length > 1 && dataForm.position == 1">
        <el-carousel-item v-for="item in fileList"  :key="item.url">
          <img :src="item.url"  style="width:100%;height: 100%"/>
        </el-carousel-item>
      </el-carousel>
      <el-badge :value="fileList.length" class="item">
        <el-upload  ref="uploadFile"
                    :disabled="disabledFlag"
                    :headers="headers"
                    :action="uploadPath"
                    :on-change="fileFlag"
                    list-type="picture-card"
                    :file-list="fileList"
                    :limit="imageSize"
                    :on-exceed="sizeExceed"
                    :on-remove="removeFile"
                    :on-success="submitSuccess"
                    :on-error="submitError"
                    accept=".jpg,.jpeg,.png,.gif"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-badge>
      <p style="color: red;">图片最佳尺寸为375px*230px</p>
      <p style="position: relative;" v-if="fileList.length == 1 && dataForm.position == 1">注意：轮播图的最大限制是10，请不要传入不是jpg,jpeg,png,gif后缀的文件 <el-button  type="primary" @click="slideshowVisible = false" style="position: absolute;right: 0">确定</el-button> </p>
    </el-dialog>

    <el-dialog :title="settingName" :visible.sync="goodsSwitchShow">
      <!-- 查询和其他操作 -->
      <div class="filter-container">
        <el-input v-model="goodsQuery.goodsSn" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品编号" />
        <el-input v-model="goodsQuery.name" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品名称"/>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getGoodsList">查找</el-button>
      </div>

      <!-- 查询结果 -->
      <el-table v-loading="goodsListLoad" :data="goodsList" element-loading-text="正在查询中。。。" border fit highlight-current-row>


        <el-table-column align="center" label="商品编号" prop="goodsSn"/>

        <el-table-column align="center" min-width="100" label="名称" prop="name"/>

        <el-table-column align="center" property="iconUrl" label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.picUrl" width="40">
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="choose(scope.row.goodsSn)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="goodsTotal>0" :total="goodsTotal" :page.sync="goodsQuery.page" :limit.sync="goodsQuery.limit" @pagination="getGoodsList" />
    </el-dialog>


  </div>
</template>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>

<script>
import { listAd, createAd, updateAd, deleteAd } from '@/api/ad'
import {listGoods} from "../../api/goods";
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Ad',
  components: { Pagination },
  data() {
    return {
      uploadPath,
      list: null,
      total: 0,

      goodsTotal:0,
      listLoading: true,
      goodsListLoad:true,
      positionChinese:['轮播图','底位1','底位2','底位3'],
      fileList:[],
      goodsList:[],
      linkList:[],
      goodsSwitchShow: false,
      idCache: undefined,
      slideshowVisible: false,
      disabledFlag: false,
      disabledFlag1:false,
      deleteFlag : false,
      imageSize: 10,
      settingName:undefined,
      goodsIdList:[],
      goodsQuery:{
        page: 1,
        limit: 20,
        goodsSn:undefined,
        name: undefined,
        isNew:undefined,
        isHot:undefined,
        isSale:undefined,
        sort: 'add_time',
        order: 'desc'
      },
      listQuery: {
        page: 1,
        limit: 20,
        position:undefined,
        enabled:undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        urlList:[],
        id: undefined,
        name: undefined,
        url: null,
        link: undefined,
        content:null,
        position: 1,
        enabled: true
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        url: [{ required: true, message: '图片不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  computed: {
    headers() {
      return {
        'X-Litemall-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listAd(this.listQuery)
        .then(response => {
          this.list = response.data.data.items
          this.total = response.data.data.total
          console.log(this.list)
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetGoodsQuery(){
      this.goodsQuery={
        page: 1,
        limit: 20,
        goodsSn:undefined,
        name: undefined,
        isNew:undefined,
        isHot:undefined,
        isSale:undefined,
        sort: 'add_time',
        order: 'desc'
      }
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: undefined,
        url: undefined,
        link: undefined,
        content:null,
        position: 1,
        enabled: true
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    uploadUrl(response) {
      this.dataForm.url = response.data.url
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (!this.verify()){
          return
        }
        this.toLink()
        if (valid) {
          createAd(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
              this.getList()
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
              this.getList()
            })
          if (this.dataForm.position == 1){
            this.$refs.uploadFile.clearFiles()
          }
          this.fileList = []
        }

      })
    },
    handleUpdate(row) {
      this.idCache = row.id
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (!this.verify()){
            return
          }
          this.toLink()
          updateAd(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新成功'
              })
              this.getList()
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
              this.getList()
            })
          if (this.dataForm.position == 1){
            this.$refs.uploadFile.clearFiles()
          }
          this.fileList = []
        }
      })
    },
    handleDelete(row) {
      deleteAd(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleDownload() {
      this.list.forEach(item =>{
        item.position = this.positionChinese[item.position]
      })
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '图片',
          '位置',
          '活动链接',
          '是否启用'
        ]
        const filterVal = [
          'url',
          'postion',
          'link',
          'enabled'
        ]
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '广告信息')
        this.downloadLoading = false
      })
    },
    sizeExceed(){
      alert('数量不能超过'+this.imageSize)
      this.disabledFlag = true
    },
    getFileSuffix(fileName){
      var index = fileName.lastIndexOf('.')
      console.log(fileName.substring(index))
      return fileName.substring(index)
    },
    fileFlag(file, fileList){
      var fileName = this.getFileSuffix(file.name)
      if (fileName != ".jpg" &&  fileName != ".jpeg" && fileName != ".png" && fileName != ".gif"){
        if (this.dataForm.position == 1){
          this.$refs.uploadFile.clearFiles()
        }
        alert('格式错误！！！')
        this.fileList = []
        return
      }
      this.fileList = fileList
    },
    removeFile(file, fileList){
      if (fileList.length > 0){
        this.dataForm.url = fileList[0].url
        for (let i = 1; i <fileList.length; i++) {
          this.dataForm.url += ","+fileList[i].url
        }
      } else{
        this.deleteFlag = true
        this.dataForm.url = ""
      }
      this.fileList = fileList
    },
    submitSuccess(response, file, fileList){
      if (this.dataForm.url == undefined){
        this.dataForm.url = response.data.url
      }else{
        this.dataForm.url += ","+response.data.url
      }
    },
    submitError(error, file, fileList){
      this.$message.error('上传失败：'+error)
      if (this.dataForm.position == 1){
        this.$refs.uploadFile.clearFiles()
      }
    },
    showImage(){
      if (this.dataForm.position == 1){
        this.imageSize = 10
      } else{
        if (this.dataForm.name == undefined){
          this.$message.warning("请选择一个标题")
          return
        }
        this.imageSize = 2
      }
      this.slideshowVisible = true
      this.list.forEach(item =>{
        if (item.id ==this.idCache && !this.isUrl(item.urlList) && this.dialogStatus =='update' && !this.deleteFlag){
          item.urlList.forEach(url =>{
            this.fileList.push({'name':item.name,'url':url})
          })
        }
      })
    },
    isUrl(urlList){
      for (let i = 0; i < this.fileList.length; i++) {
        if (urlList.indexOf(this.fileList[i].url) != -1){
          return true
        }
        return false
      }
    },
    closeFrom(done){
      this.fileList = []
      this.dialogFormVisible = false
    },
    verify(){
      if (this.dataForm.position == 1 && (this.dataForm.url == "" || this.dataForm.url == null || this.dataForm.url == undefined)){
        this.$message.warning('图片必须选择一张')
        return false
      }
      if (this.dataForm.position != 1 && (this.dataForm.linkList == null || this.dataForm.linkList.length != 2)){
        this.$message.warning('选择商品且等于2')
        return false
      }

      if (this.dataForm.name == "新品上市" || this.dataForm.name == "特价水果"){
        if (this.dataForm.urlList == null || this.dataForm.urlList.length != 2 || this.dataForm.urlList[0].length != 5 || this.dataForm.urlList[1].length != 5  ){
          console.log(this.dataForm.urlList)
          this.$message.warning('输入介绍，并且字符长度等于5')
          return false
        }
      }
      return true
    },
    showGoodsTable(name){
      if (name == null || name == undefined || name == ""){
        this.$message.warning("选择标题")
        return
      }
      this.goodsSwitchShow = true;
      if (name == "新品上市"){
        this.goodsQuery.isNew = true
      }else if (name == "热门水果"){
        this.goodsQuery.isHot = true
      }else if (name == "特价水果"){
        this.goodsQuery.isSale = true
      }
      this.settingName = name+"商品设置"
      this.goodsListLoad =true
      listGoods(this.goodsQuery).then(response =>{
        this.goodsList = response.data.data.items
        this.goodsTotal = response.data.data.total
        for (let i = 0; i < this.goodsList.length; i++) {
          if (this.dataForm.linkList.indexOf(this.goodsList[i].goodsSn) != -1){
            this.goodsList.splice(i,1)
            i--
            this.goodsTotal --
          }
        }
      })
      this.goodsListLoad = false
    },
    choose(id){
      if (this.dataForm.linkList == null){
        this.dataForm.linkList = []
      }
      this.dataForm.linkList.push(id)
      this.goodsSwitchShow = false
    },
    closeGoods(goods){
      this.dataForm.linkList.splice(this.dataForm.linkList.indexOf(goods),1)
      this.dataForm.urlList.splice(this.dataForm.linkList.indexOf(goods),1)
      this.$forceUpdate()
    },
    changeName(){
      this.dataForm.linkList = []
      this.dataForm.urlList = []
      this.goodsTotal = 0
      this.dataForm.url = ""
      //固定选择
      if (this.dataForm.position == 2){
        this.dataForm.name = "新品上市";
      } else if (this.dataForm.position == 3){
        this.dataForm.name = "热门水果";
      }else{
        this.dataForm.name = "特价水果";
      }
      this.resetGoodsQuery()
    },
    toLink(){
      if (this.dataForm.position == 1){
        this.dataForm.link == null
      } else{
        this.dataForm.link = this.dataForm.linkList[0]+","
        this.dataForm.link += this.dataForm.linkList[1]
        this.dataForm.url = this.dataForm.urlList[0]+","
        this.dataForm.url += this.dataForm.urlList[1]
      }
      this.$delete(this.dataForm,"linkList")
      this.$delete(this.dataForm,"urlList")
    },
    getGoodsList() {
      this.goodsListLoad = true
      listGoods(this.goodsQuery).then(response => {
        this.goodsList = response.data.data.items
        this.goodsTotal = response.data.data.total
        this.goodsListLoad = false
      }).catch(() => {
        this.goodsList = []
        this.goodsTotal = 0
        this.goodsListLoad = false
      })
    },
    submitSuccess1(response, file, fileList){
      console.log(response)
      this.dataForm.content = response.data.url

    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    }
  }



}
</script>
