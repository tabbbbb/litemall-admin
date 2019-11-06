<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.username" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户名"/>
      <el-input v-model="listQuery.mobile" clearable class="filter-item" style="width: 200px;" placeholder="请输入手机号"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" label="用户名" prop="nickname"/>

      <el-table-column align="center" label="手机号码" prop="mobile"/>

      <el-table-column align="center" label="性别" prop="gender">
        <template slot-scope="scope">
          <el-tag >{{ genderDic[scope.row.gender] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="生日" prop="birthday"/>

      <el-table-column align="center" label="用户等级" prop="userLevel">
        <template slot-scope="scope">
          <el-tag >{{ levelDic[scope.row.userLevel] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag>{{ statusDic[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-dropdown>
            <el-button type="primary" >
              更多操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <template slot-scope="list">
                <el-dropdown-item split-button @click.native="showAddress(scope.row)">收货地址</el-dropdown-item>
                <el-dropdown-item split-button @click.native="showCollect(scope.row)">用户收藏</el-dropdown-item>
                <el-dropdown-item split-button @click.native="showFootprint(scope.row)">用户足迹</el-dropdown-item>
                <el-dropdown-item split-button @click.native="showSearch(scope.row)">搜索记录</el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog :visible.sync="dialogTableVisible" title="收货地址" >
      <el-button :loading="downloadLoading" class="filter-item" style="float: right" type="primary" icon="el-icon-download" @click="handleAddressDownload">导出</el-button>
      <el-table v-loading="listAddressLoading" :data="address" >
        <el-table-column property="nickName" label="昵称" prop="nickName"/>
        <el-table-column property="name" label="收货人姓名" prop="name" />
        <el-table-column align="center" min-width="300px" label="地址" prop="address">
          <template slot-scope="scope">
            {{ scope.row.province + scope.row.city + scope.row.area + scope.row.address }}
          </template>
        </el-table-column>
        <el-table-column property="mobile" label="手机号码" prop="mobile"/>
        <el-table-column align="center" property="isDefault" label="是否默认" prop="defaultText"/>
      </el-table>
    </el-dialog>
    <el-dialog :visible.sync="dialogCollectVisible" title="用户收藏" >
      <!-- 查询和其他操作 -->
      <div class="filter-container">
        <el-input v-model="listCollectQuery.valueId" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品ID"/>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleCollectFilter">查找</el-button>
        <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleCollectDownload">导出</el-button>
      </div>

      <!-- 查询结果 -->
      <el-table v-loading="listCollectLoading" :data="listCollect" element-loading-text="正在查询中。。。" border fit highlight-current-row>
        <el-table-column align="center" width="100px" label="用户昵称" prop="nickName" />

        <el-table-column align="center" min-width="100px" label="商品ID" prop="goodsId"/>

        <el-table-column align="center" min-width="100px" label="商品名称" prop="goodsName"/>

        <el-table-column align="center" min-width="100px" label="商品图片" prop="goodsPic" >
          <template slot-scope="scope">
            <img :src="scope.row.goodsPic" width="40" @click="goGoods(scope.row.goodsId)" >
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="isOnSale">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.isOnSale }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" min-width="100px" label="添加时间" prop="addTime" sortable />

      </el-table>

      <pagination v-show="totalCollect>0" :total="totalCollect" :page.sync="listCollectQuery.page" :limit.sync="listCollectQuery.limit" @pagination="getCollectList" />
    </el-dialog>
    <el-dialog :visible.sync="dialogSearchVisible" title="搜索历史" >
      <!-- 查询和其他操作 -->
      <div class="filter-container">
        <el-input v-model="listSearchQuery.keyword" clearable class="filter-item" style="width: 200px;" placeholder="请输入搜索历史关键字"/>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearchFilter">查找</el-button>
        <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleSearchDownload">导出</el-button>
      </div>

      <!-- 查询结果 -->
      <el-table v-loading="listSearchLoading" :data="listSearch" element-loading-text="正在查询中。。。" border fit highlight-current-row>

        <el-table-column align="center" min-width="100px" label="用户昵称" prop="nickName"/>

        <el-table-column align="center" min-width="100px" label="搜索关键字" prop="keyword"/>

        <el-table-column align="center" min-width="100px" label="搜索来源" prop="from"/>

        <el-table-column align="center" min-width="100px" label="搜索时间" prop="addTime" sortable/>
      </el-table>

      <pagination v-show="totalSearch>0" :total="totalSearch" :page.sync="listSearchQuery.page" :limit.sync="listSearchQuery.limit" @pagination="getSearchList" />
    </el-dialog>
    <el-dialog :visible.sync="dialogFootprintVisible" title="用户足迹" >
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listFootprintQuery.goodsId" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品ID"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFootprintFilter">查找</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleFootprintDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listFootprintLoading" :data="listFootprint" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" min-width="100px" label="用户昵称" prop="nickName"/>

      <el-table-column align="center" min-width="100px" label="商品ID" prop="goodsId"/>

      <el-table-column align="center" min-width="100px" label="商品名称" prop="goodsName"/>

      <el-table-column align="center" min-width="100px" label="商品图片" prop="goodsPic" >
        <template slot-scope="scope">
          <img :src="scope.row.goodsPic" width="40" @click="goGoods(scope.row.goodsId)" >
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="isOnSale">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.isOnSale }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="添加时间" prop="addTime" sortable />

    </el-table>

    <pagination v-show="totalFootprint>0" :total="totalFootprint" :page.sync="listFootprintQuery.page" :limit.sync="listFootprintQuery.limit" @pagination="getFootprintList" />
    </el-dialog>

  </div>
</template>

<script>

import { listFootprint, listHistory, listCollect, fetchList, addressByUserId } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'User',
  components: { Pagination },
  data() {
    return {
      list: null,
      address: null,
      listCollect: null,
      listSearch: null,
      listFootprint: null,
      total: 0,
      totalCollect: 0,
      totalSearch: 0,
      totalFootprint: 0,
      listLoading: true,
      listAddressLoading: true,
      listCollectLoading: true,
      listSearchLoading: true,
      listFootprintLoading: true,
      downloadLoading: false,
      dialogTableVisible: false,
      dialogCollectVisible: false,
      dialogSearchVisible: false,
      dialogFootprintVisible: false,

      genderDic: ['未知', '男', '女'],
      levelDic: ['普通用户', 'VIP用户', '高级VIP用户'],
      statusDic: ['可用', '禁用', '注销'],
      listQuery: {
        page: 1,
        limit: 20,
        nickname: undefined,
        mobile: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      addressQuery: {
        userId: undefined,
        sort: 'is_default DESC,add_time',
        order: 'desc'
      },
      listCollectQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        valueId: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      listSearchQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        keyword: null,
        sort: 'add_time',
        order: 'desc'
      },listFootprintQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        goodsId: undefined,
        sort: 'add_time',
        order: 'desc'
      },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    getCollectList() {
      this.listCollectLoading = true
      listCollect(this.listCollectQuery).then(response => {
        this.listCollect = response.data.data.items
        this.totalCollect = response.data.data.total
        console.log(this.listCollect)
        this.listCollectLoading = false
      }).catch(() => {
        this.listCollect = []
        this.totalCollect = 0
        this.listCollectLoading = false
      })
    },
    getSearchList() {
      this.listSearchLoading = true
      listHistory(this.listSearchQuery).then(response => {
        this.listSearch = response.data.data.items
        this.totalSearch = response.data.data.total
        console.log(this.listSearch)
        this.listSearchLoading = false
      }).catch(() => {
        this.listSearch = []
        this.totalSearch = 0
        this.listSearchLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDownload() {
      this.list.forEach(item =>{
        item['genderChinese'] = this.genderDic[item.gender]
        item['statusChinese'] = this.statusDic[item.status]
        item['levelChinese'] = this.levelDic[item.level]
      })
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户昵称', '手机号码','用户等级', '性别', '生日', '状态']
        const filterVal = ['nickname', 'mobile','levelChinese', 'genderChinese', 'birthday', 'statusChinese']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '用户信息')
        this.downloadLoading = false
      })
    },
    showAddress(row) {
      this.listAddressLoading = true
      this.dialogTableVisible = true
      this.addressQuery.userId = row.id
      addressByUserId(this.addressQuery).then(response => {
        this.address = response.data.data
        console.log(this.address)
      })
      this.listAddressLoading = false
    },
    handleAddressDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户昵称', '收货人', '手机号', '省', '市', '区', '地址', '是否默认']
        const filterVal = ['nickName', 'name', 'mobile', 'province', 'city', 'area', 'address', 'defaultText']
        excel.export_json_to_excel2(tHeader, this.address, filterVal, '收货地址信息')
        this.downloadLoading = false
      })
    },
    showCollect(row) {
      this.dialogCollectVisible = true
      this.listCollectQuery.userId = row.id
      this.listCollectQuery.valueId = undefined
      this.getCollectList()
    },
    handleCollectDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户昵称', '商品ID', '商品名称','商品图片url','商品状态','添加时间']
        const filterVal = ['nickName', 'goodsId', 'goodsName','goodsPic','isOnSale','addTime']
        excel.export_json_to_excel2(tHeader, this.listCollect, filterVal, '用户收藏信息')
        this.downloadLoading = false
      })
    },
    goGoods(goodsId) {
      this.$router.push('/goods/list?goodsId=' + goodsId)
    },
    handleCollectFilter() {
      this.listCollectQuery.page = 1
      this.getCollectList()
    },
    showSearch(row) {
      this.dialogSearchVisible = true
      this.listSearchQuery.userId = row.id
      this.listSearchQuery.keyword = null
      this.getSearchList()
    },
    handleSearchFilter(){
      this.listSearchQuery.page = 1
      this.getSearchList()
    },
    handleSearchDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户昵称', '搜索关键字', '搜索平台', '搜索时间']
        const filterVal = ['nickName', 'keyword', 'from', 'addTime']
        excel.export_json_to_excel2(tHeader, this.listSearch, filterVal, '用户搜索历史')
        this.downloadLoading = false
      })
    },
    getFootprintList() {
      this.listFootprintLoading = true
      listFootprint(this.listFootprintQuery)
        .then(response => {
          this.listFootprint = response.data.data.items
          this.totalFootprint = response.data.data.total
          this.listFootprintLoading = false
        })
        .catch(() => {
          this.listFootprint = []
          this.totalFootprint = 0
          this.listFootprintLoading = false
        })
    },
    showFootprint(row){
      this.dialogFootprintVisible = true
      this.listFootprintQuery.userId = row.id
      this.listFootprintQuery.goodsId = undefined
      this.getFootprintList()
    },
    handleFootprintFilter() {
      this.listFootprintQuery.page = 1
      this.getFootprintList()
    },
    handleFootprintDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户昵称', '商品ID', '商品名称','商品图片url','商品状态','添加时间']
        const filterVal = ['nickName', 'goodsId', 'goodsName','goodsPic','isOnSale','addTime']
        excel.export_json_to_excel2(tHeader, this.listFootprint, filterVal, '用户足迹')
        this.downloadLoading = false
      })
    }
  }
}
</script>
