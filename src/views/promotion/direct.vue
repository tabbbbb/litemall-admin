<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-select v-model="listQuery.position" placeholder="请选择位置" @change="getList">
        <el-option :value="-1" label="全部"/>
        <el-option v-for=" item in 8" :label="positionChinese+item" :value="item" :key="item"/>
      </el-select>
      <el-select v-model="listQuery.isStart" placeholder="请选择"  @change="getList">
        <el-option :value="null" label="全部"/>
        <el-option :value="1" label="启用"/>
        <el-option :value="0" label="不启用"/>
      </el-select>
      <el-button v-permission="['POST /admin/direct/create']" class="filter-item" type="primary" icon="el-icon-edit" style="margin-bottom: 0px" @click="showDirect">添加</el-button>
    </div>

    <el-table :data="list" border style="width: 100%" >
      <el-table-column  label="预览" >
        <template slot-scope="scope">
          <img :src="scope.row.url" />
          <p>{{scope.row.title}}</p>
        </template>
      </el-table-column>
      <el-table-column  label="位置" >
        <template slot-scope="scope">
          <p style="text-align: center"><el-tag >{{positionChinese+scope.row.position}}</el-tag></p>
        </template>
      </el-table-column>
      <el-table-column prop="link" label="跳转链接" >
        <template slot-scope="scope">
          <p style="text-align: center"><el-tag >{{scope.row.link.name}}</el-tag></p>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否启用" prop="enabled">
        <template slot-scope="scope">
          <el-tag >{{ scope.row.isStart ? '启用' : '不启用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column  label="操作">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/direct/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/direct/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <el-dialog title="添加直通车" :visible.sync="directShow">
      <el-form :model="dataForm" label-width="100px" style="width: 400px; margin-left:50px;" ref="dataForm">
        <el-form-item label="直通车标题" >
          <el-input v-model="dataForm.title" />
        </el-form-item>
        <el-form-item label="跳转链接" >
          <el-tag closable v-if="dataForm.link.name" @close="closeCategory()">{{dataForm.link.name}}</el-tag><el-button type="primary" size="mini" v-if="dataForm.link.name == null" @click="showCategory()">选择</el-button>
        </el-form-item>
        <el-form-item label="直通车位置" >
          <el-select v-model="dataForm.position" placeholder="请选择位置" >
            <el-option v-for=" item in 8" :label="positionChinese+item" :value="item" :key="item"/>
          </el-select>
        </el-form-item>

        <el-form-item label="直通车图片" >
          <el-upload
            :action="uploadPath"
            :show-file-list="false"
            :headers="headers"
            :on-success="uploadPicUrl"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif">
            <img v-if="dataForm.url" :src="dataForm.url" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
          <p style="color: red;">图片最佳尺寸为46px*46px</p>
        </el-form-item>

        <el-form-item  label="是否启用" prop="isStart">
          <el-select v-model="dataForm.isStart" placeholder="请选择">
            <el-option :value="1" label="启用"/>
            <el-option :value="0" label="不启用"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="directShow = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData" >确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="类别直通车" :visible.sync="categoryShow">

      <el-table v-loading="categoryListLoading" :data="categoryList" element-loading-text="正在查询中。。。" border fit highlight-current-row row-key="id">

        <el-table-column align="center" label="类目ID" prop="id"/>

        <el-table-column align="center" label="类目名" prop="name"/>

        <el-table-column align="center" label="类目图标" prop="iconUrl">
          <template slot-scope="scope">
            <img v-if="scope.row.iconUrl" :src="scope.row.iconUrl" width="40">
            <el-tag type="info" v-if="!scope.row.iconUrl">无</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="类别状态" prop="status">
          <template slot-scope="scope">
            <el-tag type="primary" v-if="scope.row.level == 'L1'">{{statusDic[scope.row.status]}}</el-tag>
            <el-tag type="info" v-if="scope.row.level == 'L2'">无</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="clickCategory(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
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
  import { listDirect, createDirect, updateDirect, deleteDirect } from '@/api/direct'
  import { uploadPath } from '@/api/storage'
  import { getToken } from '@/utils/auth'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import { listCategory } from '@/api/category'

  export default {
    name: 'direct',
    components: {Pagination},
    data() {
      return {
        uploadPath,
        list: null,
        total: 0,
        listLoading: true,
        categoryListLoading:true,
        categoryList:null,
        positionChinese:"位置",
        directShow:false,
        categoryShow:false,
        dialogStatus:null,
        listQuery: {
          page: 1,
          limit: 20,
          position: undefined,
          isStart: undefined,
          sort: 'is_start',
          order: 'desc'
        },
        dataForm: {
          title: undefined,
          url: undefined,
          link: {
            name:null,
            id:undefined
          },
          position: undefined
        },
        textMap: {
          update: '编辑',
          create: '创建'
        },
        downloadLoading: false,
        statusDic:['普通','HOT','NEW','SALE']
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
        listDirect(this.listQuery)
          .then(response => {
            this.list = response.data.data.items
            this.list.forEach(item => {
              item.link = JSON.parse(item.link)
            })
            this.total = response.data.data.total
            this.listLoading = false
          })
          .catch(() => {
            this.list = []
            this.total = 0
            this.listLoading = false
          })
      },
      showDirect(){
        this.resetForm()
        this.directShow = true
        this.dialogStatus = "create"
      },
      resetForm(){
        this.dataForm = {
          title: null,
          url: null,
          link: {
            name:null,
            id:undefined
          },
          position: null
        }
      },
      uploadPicUrl(response,file,fileList){
        this.dataForm.url = response.data.url
      },
      createData(){
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            if (!this.verify())return
            this.dataForm.link = JSON.stringify(this.dataForm.link);
            createDirect(this.dataForm)
              .then(response => {
                this.getList()
                this.directShow = false
                this.$notify.success({
                  title: '成功',
                  message: '创建成功'
                })
              })
              .catch(response => {
                this.$notify.error({
                  title: '失败',
                  message: response.data.errmsg
                })
              })
          }
        })
      },
      handleUpdate(row){
        this.dialogStatus = "update"
        this.dataForm = Object.assign({},row)
        this.directShow = true
      },
      handleDelete(row){
        row.link = JSON.stringify( row.link )
        deleteDirect(row)
          .then(response => {
            this.$notify.success({
              title: '成功',
              message: '删除成功'
            })
            this.getList()
          })
          .catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
      },
      updateData(){
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            if (!this.verify())return
            this.dataForm.link = JSON.stringify(this.dataForm.link);
            updateDirect(this.dataForm)
              .then(() => {
                this.getList()
                this.directShow = false
                this.$notify.success({
                  title: '成功',
                  message: '更新成功'
                })
              })
              .catch(response => {
                this.$notify.error({
                  title: '失败',
                  message: response.data.errmsg
                })
              })
          }
        })
      },
      verify(){
        const data = this.dataForm
        if (data.title == null || data.title == "" || data.title == undefined){
          this.$message.warning("直通车标题不能为空")
          return false
        } else if (data.link == null || data.link.name == "" || data.link.id == undefined) {
          this.$message.warning("直通车跳转链接不能为空")
          return false
        }else if (data.url == null || data.url == "" || data.url == undefined) {
          this.$message.warning("直通车图片不能为空")
          return false
        }else if (data.position == null || data.position == undefined) {
          this.$message.warning("位置请选择")
          return false
        }else if (data.isStart == null || data.isStart == undefined) {
          this.$message.warning("是否启用请选择")
          return false
        }
        return true
      },
      showCategory(){
        this.categoryListLoading = true
        this.categoryShow = true
        listCategory()
          .then( response => {
            this.categoryList = response.data.data
            this.categoryListLoading = false
          })
          .catch(() => {
            this.categoryList = []
            this.categoryListLoading = false
          })
      },
      clickCategory(row){
        this.categoryShow = false
        this.dataForm.link={
          "name":row.name,
          "id":row.id
        }
      },
      closeCategory(){
        this.dataForm.link = {
          "name":null,
          "id":undefined
        }
      }
    }
  }
</script>
