<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.goodsSn" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品编号"/>
      <el-input v-model="listQuery.name" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品名称"/>
      <el-select @change="changeTypeId" v-model="typeId" style="width: 200px" class="filter-item">
        <el-option :value="0" label="全部" key=" 0"/>
        <el-option :value="1" label="新品"  key="1"/>
        <el-option :value="2" label="热卖"  key="2"/>
        <el-option :value="3" label="特价"  key="3"/>
        <el-option :value="4" label="普通"  key="4"/>
      </el-select>
      <el-select  v-model="listQuery.isOnSale" style="width: 200px" class="filter-item">
        <el-option :value="undefined" label="全部"  key="true"/>
        <el-option :value="true" label="在售中"  key="true"/>
        <el-option :value="false" label="未售中"  key="false"/>
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" class="table-expand">
            <el-form-item label="宣传画廊">
              <img v-for="pic in props.row.gallery" :key="pic" :src="pic" class="gallery">
            </el-form-item>
            <el-form-item label="商品介绍">
              <span>{{ props.row.brief }}</span>
            </el-form-item>
            <el-form-item label="商品单位">
              <span>{{ props.row.unit }}</span>
            </el-form-item>
            <!--<el-form-item label="关键字">-->
              <!--<span>{{ props.row.keywords }}</span>-->
            <!--</el-form-item>-->
            <el-form-item label="类目ID">
              <span>{{ props.row.categoryId }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>

      <el-table-column align="center" label="商品编号" prop="goodsSn"/>

      <el-table-column align="center" min-width="100" label="名称" prop="name"/>

      <el-table-column align="center" property="iconUrl" label="图片">
        <template slot-scope="scope">
          <img :src="scope.row.picUrl" width="40">
        </template>
      </el-table-column>


      <el-table-column align="center" label="详情" prop="detail">
        <template slot-scope="scope">
          <el-dialog :visible.sync="detailDialogVisible" title="商品详情">
            <div v-html="goodsDetail"/>
          </el-dialog>
          <el-button type="primary" size="mini" @click="showDetail(scope.row.detail)">查看</el-button>
        </template>
      </el-table-column>

      <el-table-column align="center" label="专柜价格" prop="counterPrice"/>

      <el-table-column align="center" label="一类价格" prop="onePrice"/>

      <el-table-column align="center" label="二类价格" prop="twoPrice"/>

      <el-table-column align="center" label="三类价格" prop="threePrice"/>

      <el-table-column align="center" label="是否新品" prop="isNew">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isNew ? 'success' : 'error' ">{{ scope.row.isNew ? '新品' : '非新品' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="销量" prop="sales"/>

      <el-table-column align="center" label="是否热品" prop="isHot">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isHot ? 'success' : 'error' ">{{ scope.row.isHot ? '热品' : '非热品' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="是否在售" prop="isOnSale">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isOnSale ? 'success' : 'error' ">{{ scope.row.isOnSale ? '在售' : '未售' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否特价" prop="isOnSale">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isSale ? 'success' : 'error' ">{{ scope.row.isSale ? '特价' : '非特价' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :visibility-height="100" />
    </el-tooltip>

  </div>
</template>

<style>
  .table-expand {
    font-size: 0;
  }
  .table-expand label {
    width: 100px;
    color: #99a9bf;
  }
  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  .gallery {
    width: 80px;
    margin-right: 10px;
  }
</style>

<script>
import { listGoods, deleteGoods } from '@/api/goods'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'GoodsList',
  components: { BackToTop, Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      typeId:0,
      listQuery: {
        page: 1,
        limit: 20,
        goodsSn: undefined,
        name: undefined,
        isOnSale:undefined,
        isHot:undefined,
        isSale:undefined,
        isNew:undefined,
        sort: 'add_time',
        order: 'desc'
      },
      goodsDetail: '',
      detailDialogVisible: false,
      downloadLoading: false
    }
  },
  created() {
    var goodsId = this.$route.query.goodsId
    if (goodsId != null && goodsId != undefined && goodsId != '') {
      this.listQuery.goodsSn = Number.parseInt(goodsId)
    }
    var page = this.$route.query.page
    var limit = this.$route.query.limit
    var goodsSn = this.$route.query.goodsSn
    var name = this.$route.query.name
    var isOnSale = this.$route.query.isOnSale
    var isHot = this.$route.query.isHot
    var isSale = this.$route.query.isSale
    var isNew = this.$route.query.isNew
    var sort = this.$route.query.sort
    var order = this.$route.query.order
    this.typeId = this.$route.query.typeId
    if (this.typeId == null){
      this.typeId = 0
    }
    if (page != null){
      this.listQuery.page = page
    }
    if (limit != null){
      this.listQuery.limit = limit
    }
    if (goodsSn != null){
      this.listQuery.goodsSn = goodsSn
    }
    if (name != null){
      this.listQuery.name = name
    }
    if (isOnSale != null){
      this.listQuery.isOnSale = isOnSale
    }
    if (isHot != null){
      this.listQuery.isHot = isHot
    }
    if (isSale != null){
      this.listQuery.isSale = isSale
    }
    if (isNew != null){
      this.listQuery.isNew = isNew
    }
    if (sort != null){
      this.listQuery.sort = sort
    }
    if (order != null){
      this.listQuery.order = order
    }
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listGoods(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
        console.log(this.list)
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
    handleCreate() {
      this.$router.push({ path: '/goods/create', query: { page: this.listQuery.page,
          limit: this.listQuery.limit,
          goodsSn: this.listQuery.goodsSn,
          name: this.listQuery.name,
          isOnSale:this.listQuery.isOnSale,
          isHot:this.listQuery.isHot,
          isSale:this.listQuery.isSale,
          isNew:this.listQuery.isNew,
          sort: this.listQuery.sort,
          order: this.listQuery.order,
          typeId:this.typeId
      } })
    },
    handleUpdate(row) {
      this.$router.push({ path: '/goods/edit', query: {
        id:row.id,
          page: this.listQuery.page,
          limit: this.listQuery.limit,
          goodsSn: this.listQuery.goodsSn,
          name: this.listQuery.name,
          isOnSale:this.listQuery.isOnSale,
          isHot:this.listQuery.isHot,
          isSale:this.listQuery.isSale,
          isNew:this.listQuery.isNew,
          sort: this.listQuery.sort,
          order: this.listQuery.order,
          typeId:this.typeId
        }})
    },
    showDetail(detail) {
      this.goodsDetail = detail
      this.detailDialogVisible = true
    },
    handleDelete(row) {
      deleteGoods(row).then(response => {
        this.$notify.success({
          title: '成功',
          message: '删除成功'
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品ID', '商品编号', '名称', '专柜价格'     , '一类价格', '二类价格', '三类价格', '是否新品', '是否热品', '是否在售', '首页主图', '宣传图片列表', '商品介绍', '详细介绍', '商品图片', '商品单位', '类目ID']
        const filterVal = ['id'  , 'goodsSn' , 'name', 'counterPrice', 'onePrice', 'twoPrice', 'threePrice', 'isNew', 'isHot', 'isOnSale', 'picUrl'     , 'gallery'    , 'brief'  , 'detail', 'picUrl', 'unit' , 'categoryId']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品信息')
        this.downloadLoading = false
      })
    },
    resetTypeId(){
      this.listQuery.isHot = undefined
      this.listQuery.isSale = undefined
      this.listQuery.isNew = undefined
    },
    changeTypeId(){
      this.resetTypeId()
      if (this.typeId == 1){
        this.listQuery.isNew = true
      }else if (this.typeId == 2){
        this.listQuery.isHot = true
      }else if (this.typeId == 3){
        this.listQuery.isSale = true
      }else if (this.typeId == 4){
        this.listQuery.isHot = false
        this.listQuery.isSale = false
        this.listQuery.isNew = false
      }
    }
  }
}
</script>
