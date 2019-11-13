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
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload" style="margin-bottom: 0px">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" label="位置" prop="position">
        <template slot-scope="scope">
          <el-tag >{{ positionChinese[scope.row.position-1] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="图片" prop="url">
        <template slot-scope="scope">
          <img  :src="scope.row.urlList[0]" width="80">
        </template>
      </el-table-column>


      <el-table-column align="center" label="跳转链接" prop="link"/>

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
          <el-select v-model="dataForm.position" placeholder="请选择">
            <el-option v-for="(item,index) in positionChinese" :label="item" :key="index+1"  :value="index+1"/>
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="name" v-if="dataForm.position != 1">
          <el-input v-model="dataForm.name"/>
        </el-form-item>


        <el-form-item  label="图片" prop="urlList">
          <el-button icon="el-icon-tickets" type="primary" @click="showImage()" >设置</el-button>
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



    <el-dialog title="图片设置" :visible.sync="slideshowVisible">
      <el-carousel indicator-position="outside" trigger="click" v-if="fileList.length > 1">
        <el-carousel-item v-for="(item,index) in fileList"  :key="item.url">
          <el-input :value="linkList[index]" v-model="linkList[index]" placeholder="请输入此张图片的跳转链接" @input="$forceUpdate()"/>
          <img :src="item.url"  style="width:100%;height: 100%"/>
        </el-carousel-item>
      </el-carousel>
      <el-input :value="linkList[0]" v-model="linkList[0]" placeholder="请输入此张图片的跳转链接" v-if="fileList.length == 1" />
      <img :src="fileList[0].url"  style="width:100%;height: 300px;" v-if="fileList.length == 1"/>
      <el-badge :value="fileList.length" class="item">
        <el-upload  ref="uploadFile"
                    :disabled="disabledFlag"
                    :headers="headers"
                    :action="uploadPath"
                    :on-change="fileFlag"
                    list-type="picture-card"
                    :file-list="fileList"
                    :limit="10"
                    :on-exceed="sizeExceed"
                    :on-remove="removeFile"
                    :on-success="submitSuccess"
                    :on-error="submitError"
                    accept=".jpg,.jpeg,.png,.gif"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-badge>

      <p style="position: relative;">注意：轮播图的最大限制是10，请不要传入不是jpg,jpeg,png,gif后缀的文件 <el-button  type="primary" @click="slideshowVisible = false" style="position: absolute;right: 0">确定</el-button> </p>
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
      listLoading: true,
      positionChinese:['轮播图','底位1','底位2','底位3'],
      fileList:[],
      linkList:[],
      idCache: undefined,
      slideshowVisible: false,
      disabledFlag: false,
      deleteFlag : false,
      listQuery: {
        page: 1,
        limit: 20,
        position:undefined,
        enabled:undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        name: undefined,
        url: null,
        link: undefined,
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
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: undefined,
        content: undefined,
        url: undefined,
        link: undefined,
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
    uploadUrl: function(response) {
      this.dataForm.url = response.data.url
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        this.toLink()
        if (!this.verify()){
          return
        }
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
          this.$refs.uploadFile.clearFiles()
          this.fileList = []
          this.linkList = []
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
          this.toLink()
          if (!this.verify()){
            return
          }
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
          this.$refs.uploadFile.clearFiles()
          this.fileList = []
          this.linkList = []
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
      alert('数量不能超过10')
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
        this.$refs.uploadFile.clearFiles()
        alert('格式错误！！！')
        this.fileList = []
        return
      }
      this.fileList = fileList
    },
    removeFile(file, fileList){
      for (let i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i].url == file.url){
          this.linkList.splice(i,1)
        }
      }
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
      this.$refs.uploadFile.clearFiles()
    },
    showImage(){
      this.slideshowVisible = true
      this.list.forEach(item =>{
        if (item.id ==this.idCache && !this.isUrl(item.urlList) && this.dialogStatus =='update' && !this.deleteFlag){
          item.urlList.forEach(url =>{
            this.fileList.push({'name':item.name,'url':url})
          })
          item.linkList.forEach(link =>{
            this.linkList.push(link)
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
      this.linkList = []
      this.fileList = []
      this.dialogFormVisible = false
    },
    toLink(){
      if (this.linkList != null && this.linkList.length != 0){
        this.dataForm.link = ""
        this.dataForm.link = this.linkList[0]
        for (let i = 1; i < this.linkList.length; i++) {
          this.dataForm.link += ","+this.linkList[i]
        }
      }

    },
    verify(){
      if (this.dataForm.url == "" || this.dataForm.url == null || this.dataForm.url == undefined){
        this.$message.warning('图片必须选择一张')
        return false
      }
      if (this.dataForm.link == "" || this.dataForm.link == null || this.dataForm.link == undefined){
        this.$message.warning('url必须输入')
        return false
      }
      return true
    }
  }
}
</script>
