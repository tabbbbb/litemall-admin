<template>
  <div class="app-container">
    <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-width="300px">
      <el-form-item label="订金" prop="litemall_down_payment">
        <el-input v-model="dataForm.litemall_down_payment"/>
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="update">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {listDown , updateDown} from "@/api/config";


    export default {
      name: "down",
      data() {
        return {
          dataForm: {
            litemall_down_payment: 0,
          },
          rules: {
            litemall_down_payment: [
              { required: true, message: '不能为空', trigger: 'blur' }
            ]
          }
        }
      },
      created() {
        this.init()
      },
      methods: {
        init: function() {
          listDown().then(response => {
            this.dataForm = response.data.data
          })
        },
        cancel() {
          this.init()
        },
        update() {
          this.$refs['dataForm'].validate((valid) => {
            if (!valid) {
              return
            }
            updateDown(this.dataForm).then(response => {
              this.$notify.success({
                title: '成功',
                message: '运费配置修改成功'
              })
            }).catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
          })
        }
      }
    }
</script>

<style scoped>

</style>
