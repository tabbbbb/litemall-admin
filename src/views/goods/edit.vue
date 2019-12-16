<template>
  <div class="app-container">

    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form ref="goods" :model="goods" label-width="150px">
        <el-form-item label="商品编号" prop="goodsSn" >
          <el-input v-model="goods.goodsSn" @input="$forceUpdate()"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="goods.name" @input="$forceUpdate()"/>
        </el-form-item>
        <el-form-item label="专柜价格" prop="counterPrice">
          <el-input type="number" v-model="goods.counterPrice" placeholder="0.00" @input="$forceUpdate()">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="一类价格" prop="counterPrice">
          <el-input type="number" v-model="goods.onePrice" maxlength="7" placeholder="0.00" @input="$forceUpdate()">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="二类价格" prop="counterPrice">
          <el-input type="number" v-model="goods.twoPrice" maxlength="7" placeholder="0.00" @input="$forceUpdate()">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="三类价格" prop="counterPrice">
          <el-input type="number" v-model="goods.threePrice" maxlength="7" placeholder="0.00" @input="$forceUpdate()">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="是否新品" prop="isNew">
          <el-radio-group v-model="goods.isNew">
            <el-radio :label="true">新品</el-radio>
            <el-radio :label="false">非新品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否热卖" prop="isHot">
          <el-radio-group v-model="goods.isHot">
            <el-radio :label="false">普通</el-radio>
            <el-radio :label="true">热卖</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否在售" prop="isOnSale">
          <el-radio-group v-model="goods.isOnSale">
            <el-radio :label="true">在售</el-radio>
            <el-radio :label="false">未售</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否特价" prop="isSale">
          <el-radio-group v-model="goods.isSale" @change="changeRadio">
            <el-radio :label="true" >特价</el-radio>
            <el-radio :label="false">非特价</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="商品图片">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif">
            <img v-if="goods.picUrl" :src="goods.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>

          </el-upload>
          <p style="color: red;">图片最佳尺寸为170*170px，展示在首页或是热门水果，特价，新品上市的分类中</p>
        </el-form-item>

        <el-form-item label="宣传画廊">
          <el-upload
            :action="uploadPath"
            :headers="headers"
            :limit="5"
            :file-list="galleryFileList"
            :on-exceed="uploadOverrun"
            :on-success="handleGalleryUrl"
            :on-remove="handleRemove"
            multiple
            accept=".jpg,.jpeg,.png,.gif"
            list-type="picture-card">
            <i class="el-icon-plus"/>

          </el-upload>
          <p style="color: red;">图片最佳尺寸为375px*260px，第一张为商品页面展示图片</p>
        </el-form-item>

        <el-form-item label="商品单位">
          <el-input v-model="goods.unit" placeholder="件 / 个 / 盒"/>
        </el-form-item>

        <!--<el-form-item label="关键字">-->
          <!--<el-tag v-for="tag in keywords" :key="tag" closable type="primary" @close="handleClose(tag)">-->
            <!--{{ tag }}-->
          <!--</el-tag>-->
          <!--<el-input v-if="newKeywordVisible" ref="newKeywordInput" v-model="newKeyword" class="input-new-keyword" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm"/>-->
          <!--<el-button v-else class="button-new-keyword" type="primary" @click="showInput">+ 增加</el-button>-->
        <!--</el-form-item>-->

        <el-form-item label="所属分类">
          <el-cascader :options="categoryList" v-model="categoryIds" expand-trigger="hover" @change="handleCategoryChange"/>
        </el-form-item>

        <!--<el-form-item label="产地">-->
          <!--<el-cascader :options="regionList" expand-trigger="hover"  change-on-select v-model="selecedAddress"/>-->
        <!--</el-form-item>-->



        <el-form-item label="商品详细介绍">
          <editor :init="editorInit" v-model="goods.detail"/>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <h3>商品规格</h3>
      <el-button :plain="true" type="primary" @click="handleSpecificationShow">添加</el-button>

      <el-table :data="specifications">

        <el-table-column property="specification" label="规格名" />
        <el-table-column property="value" label="规格值" >
          <template slot-scope="scope">
            <el-tag type="primary">
              {{ scope.row.value }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column property="picUrl" label="规格图片">
          <template slot-scope="scope">
            <img v-if="scope.row.picUrl" :src="scope.row.picUrl" width="40">
          </template>
        </el-table-column>


        <el-table-column label="专柜价格"  prop="counterPrice"/>



        <el-table-column label="一类价格" prop="onePrice" />




        <el-table-column label="二类价格" prop="twoPrice"/>




        <el-table-column label="三类价格" prop="threePrice"/>


        <el-table-column label="此规格库存" prop="number" />


        <el-table-column property="isDefault" label="是否默认">
          <template slot-scope="scope">
            <el-tag type="primary">
              {{ scope.row.isDefault == 1 ? "是":"否"}}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="250" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleSpecificationDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>





      <el-dialog :visible.sync="specVisiable" title="设置规格">

        <el-form ref="specForm"  :model="specForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

          <el-form-item label="规格名" prop="specification">
            <el-input v-model="specForm.specification"/>
          </el-form-item>

          <el-form-item label="规格值" prop="value">
            <el-input v-model="specForm.value"/>
          </el-form-item>


          <el-form-item label="此规格库存">
            <el-input type="number" v-model="specForm.number" prop="number"/>
          </el-form-item>


          <el-form-item label="专柜价格">
            <el-input type="number" v-model="specForm.counterPrice" maxlength="7" placeholder="0.00" :disabled="disabledFlag" @input="$forceUpdate()">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>



          <el-form-item label="一类价格" >
            <el-input type="number" v-model="specForm.onePrice" maxlength="7" placeholder="0.00"  :disabled="disabledFlag" @input="$forceUpdate()">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>



          <el-form-item label="二类价格" >
            <el-input type="number" v-model="specForm.twoPrice" maxlength="7" placeholder="0.00" :disabled="disabledFlag"@input="$forceUpdate()" >
              <template slot="append">元</template>
            </el-input>
          </el-form-item>



          <el-form-item label="三类价格">
            <el-input type="number" v-model="specForm.threePrice" maxlength="7" placeholder="0.00"  :disabled="disabledFlag" @input="$forceUpdate()">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>

          <el-form-item property="isDefault" label="是否默认">
            <el-select @change="changeDefault" v-model="specForm.isDefault">
              <el-tooltip class="item" effect="dark" content="选中默认与商品的展示价格相同" placement="top">
                <el-option :value="1" label="是" key="1"/>
              </el-tooltip>
              <el-option :value="0" label="否"  key="0"/>
            </el-select>
          </el-form-item>

          <el-form-item label="规格图片" prop="picUrl">
            <el-upload
              :headers="headers"
              :action="uploadPath"
              :show-file-list="false"
              :on-success="uploadSpecPicUrl1"
              class="avatar-uploader"
              accept=".jpg,.jpeg,.png,.gif">
              <img v-if="specForm.picUrl" :src="specForm.picUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"/>
            </el-upload>
            <p style="color: red;">图片最佳尺寸为1:1 像素越高越清晰</p>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="specVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleSpecificationAdd">确定</el-button>
        </div>
      </el-dialog>
    </el-card>






    <el-card class="box-card">

      <h3>商品参数</h3>
      <el-button :plain="true" type="primary" @click="handleAttributeShow">添加</el-button>

      <el-table :data="attributes">

        <el-table-column property="attribute" label="商品参数名称"/>

        <el-table-column property="value" label="商品参数值"/>

        <el-table-column align="center" label="操作" width="100" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleAttributeDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>




      <el-dialog :visible.sync="attributeVisiable" title="设置商品参数">

        <el-form ref="attributeForm" :model="attributeForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
          <el-form-item label="商品参数名称" prop="attribute">
            <el-input v-model="attributeForm.attribute" :disabled="disabledAttr" @input="$forceUpdate()"/>
          </el-form-item>

          <el-form-item label="商品参数值" prop="value" >
            <el-input v-model="attributeForm.value" @input="$forceUpdate()"/>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="attributeVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleAttributeAdd">确定</el-button>
        </div>
      </el-dialog>

    </el-card>




    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleEdit">更新商品</el-button>
    </div>



  </div>
</template>

<style>
.el-card {
  margin-bottom: 10px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.input-new-keyword {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
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
import { detailGoods, editGoods, listCatAndBrand,listRegion } from '@/api/goods'
import { createStorage, uploadPath } from '@/api/storage'
import Editor from '@tinymce/tinymce-vue'
import { MessageBox } from 'element-ui'
import { getToken } from '@/utils/auth'

export default {
  name: 'GoodsEdit',
  components: { Editor },
  data() {
    return {
      uploadPath,
      newKeywordVisible: false,
      newKeyword: '',
      disabledAttr:false,
      keywords: [],
      galleryFileList: [],
      selecedAddress:[],
      categoryList: [],
      brandList: [],
      categoryIds: [],
      disabledFlag:false,
      goods: { gallery: [],isSale:undefined },
      regionList:[],
      specVisiable: false,
      specForm: {
        specification:null,
        value:null,
        counterPrice: 0,
        onePrice:0,
        twoPrice:0,
        threePrice:0,
        isDefault:0,
        number: 0
      },
      specifications: [],
      productVisiable: false,
      attributeVisiable: false,
      attributeForm: { attribute: '', value: '' },
      attributes: [],
      rules: {
        goodsSn: [
          { required: true, message: '商品编号不能为空', trigger: 'blur' }
        ],
        name: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],

      },

      editorInit: {
        language: 'zh_CN',
        convert_urls: false,
        plugins: [
          'advlist anchor autolink autosave code codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools importcss insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount'
        ],
        toolbar: [
          'searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample',
          'hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'
        ],
        images_upload_handler: function(blobInfo, success, failure) {
          const formData = new FormData()
          formData.append('file', blobInfo.blob())
          createStorage(formData)
            .then(res => {
              success(res.data.data.url)
            })
            .catch(() => {
              failure('上传失败，请重新上传')
            })
        }
      }
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
    this.init()
  },
  methods: {
    init: function() {
      if (this.$route.query.id == null) {
        return
      }
      const goodsId = this.$route.query.id
      detailGoods(goodsId).then(response => {
        this.goods = response.data.data.goods
        console.log(this.goods)
        this.selecedAddress.push(this.goods.provinceId)
        this.selecedAddress.push(this.goods.cityId)
        this.selecedAddress.push(this.goods.areaId)

        this.specifications = response.data.data.specifications
        this.products = response.data.data.products
        this.attributes = response.data.data.attributes
        this.categoryIds = response.data.data.categoryIds

        this.galleryFileList = []
        for (var i = 0; i < this.goods.gallery.length; i++) {
          this.galleryFileList.push({
            url: this.goods.gallery[i]
          })
        }
        const keywords = response.data.data.goods.keywords
        if (keywords !== null) {
          this.keywords = keywords.split(',')
        }
      })

      listCatAndBrand().then(response => {
        this.categoryList = response.data.data.categoryList
        this.brandList = response.data.data.brandList
      })
    },
    handleCategoryChange(value) {
      this.goods.categoryId = value[value.length - 1]
    },
    handleCancel: function() {
      this.$router.push({ path: '/goods/list' })
    },
    handleEdit: function() {

      let data = this.goods
      if (data.goodsSn == null || data.goodsSn == "" || data.goodsSn == undefined){
        this.$message.warning("输入商品编号")
      } else if (data.name == null || data.name == "" || data.name == undefined){
        this.$message.warning("商品名称不能为空")
      }else if (data.isNew == null){
        this.$message.warning("是否新品请选择")
      }else if (data.isHot == null ){
        this.$message.warning("是否热卖请选择")
      }else if (data.onePrice == null ||  data.onePrice <= 0 ){
        this.$message.warning("一类价格必须大于0")
      }else if (data.twoPrice == null ||data.twoPrice <= 0){
        this.$message.warning("二类价格必须大于0")
      }else if (data.threePrice == null ||data.threePrice <= 0){
        this.$message.warning("三类价格必须大于0")
      }else if (data.counterPrice == null ||data.counterPrice <= 0){
        this.$message.warning("专柜价格必须大于0")
      }else if (data.isOnSale == null){
        this.$message.warning("是否在售请选择")
      }else if ((data.picUrl == null ||  data.picUrl == "") || (data.isHot || data.isNew || data.isSale)){
        this.$message.warning("商品图片请选择")
      }else if (data.unit == null ||  data.unit == ""){
        this.$message.warning("商品单位不能为空")
      }else if (data.gallery == null ||  data.gallery.length <1){
        this.$message.warning("宣传画廊请选择")
      }else if (data.categoryId == null ){
        this.$message.warning("商品类别请选择")
      }else if(this.attributes.length !=  4){
        this.$message.warning("商品参数不能小于4")
      }else{
        var num = 0
        this.specifications.forEach(item =>{
          if (item.isDefault == 1){
            num ++
          }
        })
        if (num == 0){
          this.$message.warning("必须指定一个默认规格")
          return
        }else if (num >1) {
          this.$message.warning("只能指定一个默认规格")
          return
        }
        if (this.selecedAddress[0] != null){
          this.goods.provinceId = this.selecedAddress[0]
        }else if(this.selecedAddress[1] != null){
          this.goods.cityId = this.selecedAddress[1]
        }else if(this.selecedAddress[2] != null){
          this.goods.areaId = this.selecedAddress[2]
        }
        const finalGoods = {
          goods: this.goods,
          specifications: this.specifications,
          attributes: this.attributes
        }
        editGoods(finalGoods)
          .then(response => {
            this.$notify.success({
              title: '成功',
              message: '创建成功'
            })
            this.$router.push({ path: '/goods/list' })
          })
          .catch(response => {
            MessageBox.alert('业务错误：' + response.data.errmsg, '警告', {
              confirmButtonText: '确定',
              type: 'error'
            })
          })
      }


    },
    handleClose(tag) {
      this.keywords.splice(this.keywords.indexOf(tag), 1)
      this.goods.keywords = this.keywords.toString()
    },
    showInput() {
      this.newKeywordVisible = true
      this.$nextTick(_ => {
        this.$refs.newKeywordInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const newKeyword = this.newKeyword
      if (newKeyword) {
        this.keywords.push(newKeyword)
        this.goods.keywords = this.keywords.toString()
      }
      this.newKeywordVisible = false
      this.newKeyword = ''
    },
    uploadPicUrl: function(response) {
      this.goods.picUrl = response.data.url
    },
    uploadOverrun: function() {
      this.$message({
        type: 'error',
        message: '上传文件个数超出限制!最多上传5张图片!'
      })
    },
    handleGalleryUrl(response, file, fileList) {
      if (response.errno === 0) {
        this.goods.gallery.push(response.data.url)
      }
    },
    handleRemove: function(file, fileList) {
      for (var i = 0; i < this.goods.gallery.length; i++) {
        // 这里存在两种情况
        // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
        //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
        // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
        var url
        if (file.response === undefined) {
          url = file.url
        } else {
          url = file.response.data.url
        }

        if (this.goods.gallery[i] === url) {
          this.goods.gallery.splice(i, 1)
        }
      }
    },
    specChanged: function(label) {
      if (label === false) {
        this.specifications = [
          { specification: '规格', value: '标准', picUrl: '' }
        ]
      } else {
        this.specifications = []
        this.products = []
      }
    },
    uploadSpecPicUrl1: function(response) {
      this.specForm.picUrl = response.data.url
      this.$forceUpdate()
    },
    handleSpecificationShow() {
      this.specVisiable = true
    },
    handleSpecificationAdd() {
      let data = this.specForm
      if (data.specification == "" || data.specification == null){
        this.$message.warning("规格名不能为空")
      }else if (data.value == "" || data.value == null){
        this.$message.warning("规格值不能为空")
      }else if (data.onePrice == null ||data.onePrice <= 0){
        this.$message.warning("一类价格必须大于0")
      }else if (data.twoPrice == null ||data.twoPrice <= 0){
        this.$message.warning("二类价格必须大于0")
      }else if (data.threePrice == null ||data.threePrice <= 0){
        this.$message.warning("三类价格必须大于0")
      }else if (data.counterPrice == null ||data.counterPrice <= 0){
        this.$message.warning("专柜价格必须大于0")
      }else if (data.number == null ||data.number < 1){
        this.$message.warning("库存数量必须大于0")
      }else {
        var index = this.specifications.length - 1
        for (var i = 0; i < this.specifications.length; i++) {
          const v = this.specifications[i]
          if (v.specification === this.specForm.specification) {
            index = i
          }
        }

        this.specifications.splice(index + 1, 0, this.specForm)
        this.specForm = {
          specification:null,
          value:null,
          counterPrice: 0,
          onePrice:0,
          twoPrice:0,
          threePrice:0,
          isDefault:0,
          number: 0
        }
        this.disabledFlag = false
        this.specVisiable = false

        this.specToProduct()
      }

    },
    handleSpecificationDelete(row) {
      const index = this.specifications.indexOf(row)
      this.specifications.splice(index, 1)
      this.specToProduct()
    },
    specToProduct() {
      if (this.specifications.length === 0) {
        return
      }
      // 根据specifications创建临时规格列表
      var specValues = []
      var spec = this.specifications[0].specification
      var values = []
      values.push(0)

      for (var i = 1; i < this.specifications.length; i++) {
        const aspec = this.specifications[i].specification

        if (aspec === spec) {
          values.push(i)
        } else {
          specValues.push(values)
          spec = aspec
          values = []
          values.push(i)
        }
      }
      specValues.push(values)

      // 根据临时规格列表生产货品规格
      // 算法基于 https://blog.csdn.net/tyhj_sf/article/details/53893125
      var productsIndex = 0
      var products = []
      var combination = []
      var n = specValues.length
      for (var s = 0; s < n; s++) {
        combination[s] = 0
      }
      var index = 0
      var isContinue = false
      do {
        var specifications = []
        for (var x = 0; x < n; x++) {
          var z = specValues[x][combination[x]]
          specifications.push(this.specifications[z].value)
        }
        products[productsIndex] = {
          id: productsIndex,
          specifications: specifications,
          price: 0.0,
          number: 0,
          url: ''
        }
        productsIndex++

        index++
        combination[n - 1] = index
        for (var j = n - 1; j >= 0; j--) {
          if (combination[j] >= specValues[j].length) {
            combination[j] = 0
            index = 0
            if (j - 1 >= 0) {
              combination[j - 1] = combination[j - 1] + 1
            }
          }
        }
        isContinue = false
        for (var p = 0; p < n; p++) {
          if (combination[p] !== 0) {
            isContinue = true
          }
        }
      } while (isContinue)

      this.products = products
    },
    handleProductShow(row) {
      this.productForm = Object.assign({}, row)
      this.productVisiable = true
    },
    uploadProductUrl: function(response) {
      this.productForm.url = response.data.url
    },
    handleProductEdit() {
      for (var i = 0; i < this.products.length; i++) {
        const v = this.products[i]
        if (v.id === this.productForm.id) {
          this.products.splice(i, 1, this.productForm)
          break
        }
      }
      this.productVisiable = false
    },
    handleAttributeShow() {
      this.attributeForm = {}
      this.attributeVisiable = true
      var length = this.attributes.length
      var name = null
      if (length == 0 ||this.attributes[0].attribute != "规格" ){
        name = "规格"
        this.disabledAttr = true
      } else if (length == 1 ||this.attributes[1].attribute != "产地" ){
        name = "产地"
        this.disabledAttr = true
      } else if (length == 2 ||this.attributes[2].attribute != "毛重" ){
        name = "毛重"
        this.disabledAttr = true
      }else if (length == 3 ||this.attributes[3].attribute != "净重" ){
        name = "净重"
        this.disabledAttr = true
      }else{
        this.disabledAttr = false
      }
      this.attributeForm = {"attribute":name}
      console.log(this.attributeForm)
    },
    handleAttributeAdd() {
      if (this.attributes[0] != null && this.attributes[0].attribute != "规格" ){
        this.insertArray(this.attributes,0,this.attributeForm)
      } else if (this.attributes[1] != null && this.attributes[1].attribute != "产地" ){
        this.insertArray(this.attributes,1,this.attributeForm)
      } else if (this.attributes[2] != null && this.attributes[2].attribute != "毛重" ){
        this.insertArray(this.attributes,2,this.attributeForm)
      }else if (this.attributes[3] != null && this.attributes[3].attribute != "净重" ){
        this.insertArray(this.attributes,3,this.attributeForm)
      }else{
        this.attributes.push(this.attributeForm)
      }
      this.attributeVisiable = false
      this.disabledAttr = false
    },
    insertArray(array,index,value){
      var length = array.length;
      array[length] = null
      for (let i = array.length-1; i >= 0; i--) {
        if (i == index){
          array[i] = value
          console.log(array)
          return
        } else{
          array[i] = array[i-1]
        }
      }

    },
    handleAttributeDelete(row) {
      const index = this.attributes.indexOf(row)
      this.attributes.splice(index, 1)
    },
    changeDefault(){
      if (this.specForm.isDefault == 1){

        this.specForm.counterPrice = this.goods.counterPrice
        this.specForm.onePrice = this.goods.onePrice
        this.specForm.twoPrice = this.goods.twoPrice
        this.specForm.threePrice = this.goods.threePrice
        this.disabledFlag = true
      }else{
        this.specForm.counterPrice = 0
        this.specForm.onePrice = 0
        this.specForm.twoPrice = 0
        this.specForm.threePrice = 0
        this.disabledFlag = false
      }
    },
    changeRadio(){
      console.log(this.goods.isSale)
    }
  }
}
</script>
