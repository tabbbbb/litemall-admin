<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.username" clearable class="filter-item" style="width: 200px;" placeholder="请输入管理员名称"/>
      <el-button v-permission="['GET /admin/admin/list']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button v-permission="['POST /admin/admin/create']" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="管理员ID" prop="id" sortable/>

      <el-table-column align="center" label="管理员名称" prop="username"/>

      <el-table-column align="center" label="管理员头像" prop="avatar">
        <template slot-scope="scope">
          <img v-if="scope.row.avatar" :src="scope.row.avatar" width="40">
        </template>
      </el-table-column>

      <el-table-column align="center" label="管理员角色" prop="roleIds">
        <template slot-scope="scope">
          <el-tag v-for="roleId in scope.row.roleIds" :key="roleId" type="primary" style="margin-right: 20px;"> {{ formatRole(roleId) }} </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-dropdown>
            <el-button type="primary" size="small">
              更多操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <template slot-scope="list">
                <el-dropdown-item v-if="scope.row.roleIds.indexOf(1) == -1" v-permission="['PUT /admin/admin/adminIds']" split-button @click.native="showUser(scope.row)">用户管理</el-dropdown-item>
                <el-dropdown-item v-permission="['POST /admin/admin/update']"  split-button @click.native="handleUpdate(scope.row)">编辑</el-dropdown-item>
                <el-dropdown-item v-permission="['POST /admin/admin/delete']"  split-button @click.native="handleDelete(scope.row)">删除</el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="管理员名称" prop="username">
          <el-input v-model="dataForm.username"/>
        </el-form-item>
        <el-form-item label="管理员密码" prop="password">
          <el-input v-model="dataForm.password" type="password" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="管理员头像" prop="avatar">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadAvatar"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif">
            <img v-if="dataForm.avatar" :src="dataForm.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>
        <el-form-item label="管理员角色" prop="roleIds">
          <el-select  v-model="dataForm.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>


    <el-dialog :visible.sync="dialogUserVisible" title="用户管理" >

      <!-- 查询和其他操作 -->
      <div class="filter-container">
        <el-input v-model="userListQuery.username" clearable class="filter-item" style="width: 200px;" placeholder="请输入昵称"/>
        <el-input v-model="userListQuery.mobile" clearable class="filter-item" style="width: 200px;" placeholder="请输入手机号"/>
        <el-button class="filter-item" type="primary" icon="el-icon-search" size="mini" @click="handleUserFilter">查找</el-button>
        <el-button :loading="downloadLoading" class="filter-item" type="primary"  size="mini" icon="el-icon-download" @click="handleUserDownload">导出</el-button>
        <el-button v-if="!checked1"  class="filter-item" icon="el-icon-star-off" type="primary"  size="mini" @click="updateAdminIds()">分配</el-button>
        <el-checkbox v-model="checked1" @change="clickCheckbox()">此管理员的</el-checkbox>
        <el-checkbox v-model="checked2" @change="clickCheckbox()">未分配的</el-checkbox>
      </div>

      <el-table ref="userTable" :data="userList" tooltip-effect="dark" style="width: 100%" @select="handleSelectionChange"
                @select-all="handleSelectionChange">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column prop="id" label="用户id" width="120">
        </el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="120">
        </el-table-column>
        <el-table-column prop="level" label="用户等级" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag >{{ levelDic[scope.row.userLevel-1] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="性别" prop="gender">
          <template slot-scope="scope">
            <el-tag >{{ genderDic[scope.row.gender] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="mobile" label="用户手机号" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="status" label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag>{{ statusDic[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="adminId" label="管理员ID" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="adminName" label="管理员用户名" show-overflow-tooltip>
        </el-table-column>
      </el-table>
      <pagination v-if="pageShow" v-show="userTotal>0" :total="userTotal" :page.sync="userListQuery.page" :limit.sync="userListQuery.limit" @pagination="nextPage" />
      <el-pagination v-if="!pageShow" background
        @size-change="nextPage"
        @current-change="nextPage"
        :current-page.sync="userListQuery.page"
        :page-size="userListQuery.limit"
        layout="total, prev, pager, next, jumper"
        :total="userTotal"
        style="padding: 32px 16px 32px 16px;margin-top:30px; "
      >
      </el-pagination>
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
import { listAdmin, createAdmin, updateAdmin, deleteAdmin } from '@/api/admin'
import { roleOptions } from '@/api/role'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import { listVip} from '@/api/vipclass'
import {fetchList ,requestAdminIds } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination


export default {
  name: 'Admin',
  components: { Pagination },
  data() {
    return {
      uploadPath,
      checked1:true,
      checked2:false,
      checkedData:null,
      oldData:null,
      list: null,
      total: 0,
      roleOptions: null,
      listLoading: true,
      userList: null,
      userTotal: 0,
      dialogUserVisible: false,
      userListLoading: true,
      genderDic: ['未知', '男', '女'],
      levelDic: ['普通用户', 'VIP用户', '高级VIP用户'],
      statusDic: ['可用', '禁用', '注销'],
      dataList: [],
      pageShow: true,
      userListQuery: {
        page: 1,
        limit: 20,
        username: null,
        adminId: undefined,
        mobile: null
      },
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        username: undefined,
        password: undefined,
        avatar: undefined,
        roleIds: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        username: [
          { required: true, message: '管理员名称不能为空', trigger: 'blur' }
        ],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
        roleIds: [{ required: true, message: '权限不能为空', trigger: 'blur' }]
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
    this.levelDic = []
    listVip(null).then(response => {
      console.log(response)
      response.data.data.items.forEach(item =>{
        this.levelDic.push(item.vipType)
      })
    } )
    this.getList()

    roleOptions()
      .then(response => {
        this.roleOptions = response.data.data
      })
  },
  methods: {
    formatRole(roleId) {
      for (let i = 0; i < this.roleOptions.length; i++) {
        if (roleId === this.roleOptions[i].value) {
          return this.roleOptions[i].label
        }
      }
      return ''
    },
    getList() {
      this.listLoading = true
      listAdmin(this.listQuery)
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
      console.log(this.list)
    },
    getUserList() {
      this.userListLoading = true
      fetchList(this.userListQuery).then(response => {
        this.userList = response.data.data.items
        this.userTotal = response.data.data.total
        this.userListLoading = false
        this.toggleSelection()
        this.pitch()
        if (this.userListQuery.adminId == this.checkedData){
          this.oldData = this.userList
        }
        console.log("userList:")
        console.log(this.userList)
        console.log(this.userListQuery.adminId)
      }).catch(() => {
        this.userList = []
        this.userTotal = 0
        this.userListLoading = false
      })

    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        username: undefined,
        password: undefined,
        avatar: undefined,
        roleIds: []
      }
    },
    uploadAvatar: function(response) {
      this.dataForm.avatar = response.data.url
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createAdmin(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '添加管理员成功'
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
    handleUpdate(row) {
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
          updateAdmin(this.dataForm)
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
                message: '更新管理员成功'
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
    handleDelete(row) {
      deleteAdmin(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除管理员成功'
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
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['管理员ID', '管理员名称', '管理员头像']
        const filterVal = ['id', 'username', 'avatar']
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '管理员信息'
        )
        this.downloadLoading = false
      })
    },
    showUser(row) {
      this.userListQuery.adminId = row.id
      this.checked1 = true
      this.checked2 = false
      this.checkedData = row.id
      this.dialogUserVisible = true
      this.dataList = []
      this.oldData = []
      this.getUserList()
    },
    handleUserFilter() {
      this.userListQuery.page = 1
      this.getUserList()
    },
    handleUserDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户名', '手机号码', '性别', '生日', '状态','管理员id','管理员用户名']
        const filterVal = ['username', 'mobile', 'gender', 'birthday', 'status','adminId','adminName']
        excel.export_json_to_excel2(tHeader, this.userList, filterVal, '管理员管理用户信息')
        this.downloadLoading = false
      })
    },
    clickCheckbox(){
      if (this.checked2) {
        this.userListQuery.adminId = -10086
      }else if (this.checked1){
        this.userListQuery.adminId = this.checkedData
      }else{
        this.userListQuery.adminId = -1
      }
      this.getUserList()

    },
    handleSelectionChange(selection, row) { // 选中的数据索引获取
      var flag = true
      var index = this.userListQuery.page-1;
      if(this.dataList[index] == null){
        this.dataList[index] = []
      }
      if (row){
        if (this.isInclude(row.adminId)){
          for (var i = 0; i <this.dataList[index].length; i++) {
            if (this.dataList[index][i].id == row.id){
              flag = false
              this.dataList[index].splice(i,1)
            }
          }
          if (flag){
            this.dataList[index].push(row)
          }
        }
      }else{
        if (selection.length>0){
          for (let i = 0 ; i < selection.length; i++) {
            if (this.isInclude(selection[i].adminId)){

                this.dataList[index].push(selection[i])
            }
          }
        }else{
          this.dataList[index] = []
        }
      }
      if (this.dataList != null && this.dataList[this.userListQuery.page-1]!= null &&  this.dataList[this.userListQuery.page-1].length > 0){
        this.pageShow = false;
      }else{
        this.pageShow = true;
      }
    },
    toggleSelection() { // 判断是否选中
      this.$nextTick(() => {
        if (this.dataList[this.userListQuery.page-1]) {
          for (let i = 0; i < this.userList.length; i++) {
            for (let j = 0; j < this.dataList[this.userListQuery.page-1].length; j++) {
              if (this.userList[i].id == this.dataList[this.userListQuery.page-1][j].id ){
                this.$refs.userTable.toggleRowSelection(this.userList[i])
                break
              }
            }
          }
        } else {
          this.$refs.userTable.clearSelection();
        }
      });
    },
    nextPage(){
      this.getUserList();

    },
    updateAdminIds(){
      if (this.dataList!= null ) {
        var num = 0
        var ids = ""
        for (let i = 0; i <this.dataList.length; i++) {
          for (let j = 0; j < this.dataList[i].length; j++) {
            num++
            if (i == this.dataList.length-1 && j == this.dataList[i].length-1){
              ids+=this.dataList[i][j].id
            } else{
              ids+=this.dataList[i][j].id+","
            }
          }
        }
        if (num == 0){
          this.$message.warning("选中一项不是此管理员所管理用户")
          return
        }
        this.dataList = []
        requestAdminIds({
          'adminId':this.checkedData,
          'ids':ids
        }).then(response =>{
          if (response.erron == 147){
            this.$message.error(response.errmsg);
          }else{
            this.$message.success("分配成功")
            this.checked1 = true
            this.userListQuery.adminId =this.checkedData
            this.getUserList()
          }
        })

      }

    },
    pitch(){
      if (this.userListQuery.adminId == -1) {
        this.$nextTick(() => {
          for (let i = 0; i < this.userList.length; i++) {
            if (this.userList[i].adminId == this.checkedData) {
              this.$refs.userTable.toggleRowSelection(this.userList[i])
            }
          }
        })
      }
    },
    isInclude(id){
      if (this.oldData != null && this.oldData.length >0 ){
        for (let i = 0; i <this.oldData.length; i++) {
          if (this.oldData[i].adminId == id){
            return false
          }
          return true
        }
      } else{
        return true
      }
    }

  }
}
</script>
