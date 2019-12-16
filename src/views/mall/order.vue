<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.nickname" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户昵称"/>
      <el-input v-model="listQuery.orderSn" clearable class="filter-item" style="width: 200px;" placeholder="请输入订单编号"/>
      <el-select v-model="listQuery.orderStatusArray" multiple style="width: 200px" class="filter-item" placeholder="请选择订单状态">
        <el-option v-for="(key, value) in statusMap" :key="key" :label="key" :value="value"/>
      </el-select>
      <el-button v-permission="['GET /admin/order/list']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" min-width="100" label="订单编号" prop="orderSn"/>

      <el-table-column align="center" label="用户昵称" prop="nickName"/>

      <el-table-column align="center" label="手机号" prop="mobile"/>

      <el-table-column align="center" label="订单状态" prop="orderStatus">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="订单金额" prop="orderPrice"/>

      <el-table-column align="center" label="支付金额" prop="actualPrice"/>

      <el-table-column align="center" label="支付时间" prop="payTime"/>


      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['GET /admin/order/detail']" type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
          <el-button v-permission="['POST /admin/order/ship']" v-if="scope.row.orderStatus==201" type="primary" size="mini" @click="handleShip(scope.row)">发货</el-button>
          <el-button v-permission="['POST /admin/order/refund']" v-if="scope.row.orderStatus==202" type="primary" size="mini" @click="handleRefund(scope.row)">退款</el-button>
          <el-button v-permission="['POST /admin/order/notarize']" v-if="scope.row.orderStatus== 301" type="primary" size="mini" @click="showNotarize(scope.row)">收货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 订单详情对话框 -->
    <el-dialog :visible.sync="orderDialogVisible" title="订单详情" width="800">

      <el-form :data="orderDetail" label-position="left">
        <el-form-item label="订单编号">
          <span>{{ orderDetail.order.orderSn }}</span>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-tag>{{ orderDetail.order.orderStatus | orderStatusFilter }}</el-tag>
        </el-form-item>
        <el-form-item label="订单用户">
          <span>{{ orderDetail.user.nickname }}</span>
        </el-form-item>
        <el-form-item label="用户留言">
          <span>{{ orderDetail.order.message }}</span>
        </el-form-item>
        <el-form-item label="收货信息">
          <span>（收货人）{{ orderDetail.order.consignee }}</span>
          <span>（手机号）{{ orderDetail.order.mobile }}</span>
          <span>（地址）{{ orderDetail.order.address }}</span>
        </el-form-item>
        <el-form-item label="商品信息">
          <el-table :data="orderDetail.orderGoods" border fit highlight-current-row>
            <el-table-column align="center" label="商品编号" prop="goodsSn" />
            <el-table-column align="center" label="商品名称" prop="goodsName" />
            <el-table-column align="center" label="货品规格" prop="specName" >
              <template slot-scope="scope">
                <el-tag>{{scope.row.specName}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="货品价格" prop="price" />
            <el-table-column align="center" label="货品数量" prop="number" />
            <el-table-column align="center" label="货品图片" prop="pic">
              <template slot-scope="scope">
                <img :src="scope.row.pic" width="40">
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="费用信息">
          <span>
            (实际费用){{ orderDetail.order.actualPrice }}元 =
            (商品总价){{ orderDetail.order.goodsPrice }}元 +
            (快递费用){{ orderDetail.order.freightPrice }}元
          </span>
        </el-form-item>
        <el-form-item label="支付信息">
          <span>（支付渠道）微信支付</span>
          <span>（支付时间）{{ orderDetail.order.payTime }}</span>
        </el-form-item>
        <el-form-item label="快递信息">
          <span>（发货时间）{{ orderDetail.order.shipTime }}</span>
        </el-form-item>
        <el-form-item label="收货信息">
          <span>（确认收货时间）{{ orderDetail.order.confirmTime }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog :visible.sync="shipDialogVisible" title="发货">
      <p>确认发货吗？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确定</el-button>
      </div>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog :visible.sync="refundDialogVisible" title="退款">
      <el-form ref="refundForm" :model="refundForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="退款金额" prop="refundMoney">
          <el-input v-model="refundForm.refundMoney" :disabled="true"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRefund">确定</el-button>
      </div>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog :visible.sync="notarizeDialogVisible" title="用户收货">
      <el-form ref="notarizeForm" :model="notarizeForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="订单金额(元)" prop="orderPrice">
          <el-input v-model="notarizeForm.orderPrice"  disabled="true"/>
        </el-form-item>

        <el-form-item label="实付金额(元)" prop="notarizeMoney">
          <el-input v-model="notarizeForm.notarizeMoney" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="notarizeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="notarize">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>

</style>

<script>
import { listOrder, shipOrder, refundOrder, detailOrder,detailList,notarize} from '@/api/order'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数

const statusMap = {
  101: '未付款',
  102: '用户取消',
  103: '系统取消',
  201: '已付款',
  202: '申请退款',
  203: '已退款',
  301: '已发货',
  401: '用户收货'
}

export default {
  name: 'Order',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      notarizeDialogVisible:false,
      listLoading: true,
      downList:null,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined,
        orderStatusArray: [],
        sort: 'add_time',
        order: 'desc'
      },
      statusMap,
      orderDialogVisible: false,
      orderDetail: {
        order: {},
        user: {},
        orderGoods: []
      },
      shipForm: {
        orderId: undefined,
        shipChannel: undefined,
        shipSn: undefined
      },
      shipDialogVisible: false,
      refundForm: {
        orderId: undefined,
        refundMoney: undefined
      },
      notarizeForm:{
        orderId: undefined,
        orderPrice:undefined,
        notarizeMoney: undefined
      },
      refundDialogVisible: false,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      listOrder(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDetail(row) {
      detailOrder(row.id).then(response => {
        this.orderDetail = response.data.data
      })
      this.orderDialogVisible = true
    },
    handleShip(row) {
      this.shipForm.orderId = row.id

      this.shipDialogVisible = true
      this.$nextTick(() => {
        this.$refs['shipForm'].clearValidate()
      })
    },
    confirmShip() {
      shipOrder(this.shipForm).then(response => {
        this.shipDialogVisible = false
        this.$notify.success({
          title: '成功',
          message: '确认发货成功'
        })
        this.getList()
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    handleRefund(row) {
      this.refundForm.orderId = row.id
      this.refundForm.refundMoney = row.actualPrice
      this.refundDialogVisible = true
      this.$nextTick(() => {
        this.$refs['refundForm'].clearValidate()
      })
    },
    confirmRefund() {
      this.$refs['refundForm'].validate((valid) => {
        if (valid) {
          refundOrder(this.refundForm).then(response => {
            this.refundDialogVisible = false
            this.$notify.success({
              title: '成功',
              message: '确认退款成功'
            })
            this.getList()
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }
      })
    },
    handleDownload() {
      if (this.list != null){
        this.downList = []
        var ids = ""+this.list[0].id;
        var size = 0
        for (let i = 1; i <this.list.length; i++) {
          ids+=","+this.list[i].id
        }
        detailList(ids).then(response => {
          let data = response.data.data
          for (let i = 0; i < data.length; i++) {
            let order = data[i].order
            let orderGoods = data[i].orderGoods
            let user = data[i].user
            let lin = {
              'actualPrice':order.actualPrice,
              'addTime':order.addTime,
              'address':order.address,
              'comments':order.comments,
              'consignee':order.consignee,
              'couponPrice':order.couponPrice,
              'deleted':order.deleted,
              'endTime':order.endTime,
              'freightPrice':order.freightPrice,
              'goodsPrice':order.goodsPrice,
              'grouponPrice':order.grouponPrice,
              'id':order.id,
              'integralPrice':order.integralPrice,
              'message':order.message,
              'mobile':order.mobile,
              'orderPrice':order.orderPrice,
              'orderSn':order.orderSn,
              'orderStatus':this.statusMap[order.orderStatus],
              'updateTime':order.updateTime,
              'userId':order.userId,
              'avatar':user.avatar,
              'nickname':user.nickname,
              'qudao':"微信"
            }
            for (let j = 0; j < orderGoods.length; j++) {
              lin['addTime'+(j+1)] = orderGoods[j].addTime
              lin['comment'+(j+1)] = orderGoods[j].comment
              lin['deleted'+(j+1)] = orderGoods[j].deleted
              lin['goodsId'+(j+1)] = orderGoods[j].goodsId
              lin['goodsName'+(j+1)] = orderGoods[j].goodsName
              lin['id'+(j+1)] = orderGoods[j].id
              lin['number'+(j+1)] = orderGoods[j].number
              lin['orderId'+(j+1)] = orderGoods[j].orderId
              lin['pic'+(j+1)] = orderGoods[j].pic
              lin['price'+(j+1)] = orderGoods[j].price
              lin['productId'+(j+1)] = orderGoods[j].productId
              lin['specName'+(j+1)] = orderGoods[j].specName
              lin['updateTime'+(j+1)] = orderGoods[j].updateTime

            }
            if (orderGoods.length > size){
              size = orderGoods.length
            }
            this.downList.push(lin)
            if (i == this.list.length -1){
              this.downloadLoading = true
              import('@/vendor/Export2Excel').then(excel => {
                const tHeader = [
                  '订单编号', '订单状态', '订单用户', '用户留言', '收货人',
                  '收货人手机号', '收货地址','实际费用','商品总价','快递费用'
                  ,'支付渠道','支付时间','发货时间','确认收货时间'
                ]
                const filterVal = [
                  'orderSn', 'orderStatus', 'nickname', 'message', 'consignee',
                  'mobile', 'address','orderPrice','goodsPrice','freightPrice',
                  'qudao','payTime','shipTime','confirmTime'
                ]
                console.log(size)
                for (let j = 0; j <size; j++) {
                  tHeader.push('商品名称'+(j+1))
                  tHeader.push('商品规格'+(j+1))
                  tHeader.push('商品价格'+(j+1))
                  tHeader.push('商品数量'+(j+1))
                  filterVal.push('goodsName'+(j+1))
                  filterVal.push('specName'+(j+1))
                  filterVal.push('price'+(j+1))
                  filterVal.push('number'+(j+1))
                }
                console.log(lin)
                excel.export_json_to_excel2(tHeader, this.downList, filterVal, '订单信息')
                this.downloadLoading = false
              })
            }
          }
        })
      }
    },
    showNotarize(row){
      console.log(row)
      this.notarizeForm.orderId = row.id
      this.notarizeForm.orderPrice = row.orderPrice
      this.notarizeForm.notarizeMoney = row.orderPrice
      this.notarizeDialogVisible = true
      console.log(this.notarizeForm)
    },
    notarize(){
      var flag =  confirm("确认吗？请认真核对价格，此后不能修改！")
      if (flag){
        notarize(this.notarizeForm)
          .then(response =>{
            this.$notify.success({
              title: '成功',
              message: '确认收货成功'
            })
            this.notarizeDialogVisible = false
            this.getList()
          }).catch(response =>{
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }
    }
  }
}
</script>
