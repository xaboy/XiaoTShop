var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    id: 0,
    goods: {},
    gallery: [],// 轮播数据
    attribute: [],

    brand: {},// 品牌数据
    specificationList: [],// 功能分类、功能模块和功能点
    models:[],// 某功能分类下的 功能模块和功能点
    _checkedProductList:[],// 已经选中的产品
    _checkedProductDots:[],// 已经选中的功能点
    _checkedProductPrice:0,// 选中的价格
    _checkedProductNum:0,// 选中的功能点个数

    cartGoodsCount: 0,
    userHasCollect: 0,
    number: 1,
    checkedSpecText: '请选择规格数量',
    openAttr: false,
    noCollectImage: "/static/images/icon_collect.png",
    hasCollectImage: "/static/images/icon_collect_checked.png",
    collectBackImage: "/static/images/icon_collect.png"
  },
  getGoodsInfo: function () {
    let that = this;
    util.request(api.ProjectGood, { type_id: 1 }).then(function (res) { //that.data.id
      console.log(res);
      if (res.code === 200) {
        var tmpPrice = res.data.info.goods_price * 100
        that.setData({
          goods: res.data.info,
          gallery: res.data.info.carousel_imgs,
          attribute: res.data.attribute,
          brand: {name:'XiaoT科技',id:'1'},
          specificationList: res.data.sku,
          _checkedProductPrice:tmpPrice,
          // 收藏
          userHasCollect: res.data.userHasCollect
        });

        // 收藏相关代码
        if (res.data.userHasCollect == 1) {
          that.setData({
            'collectBackImage': that.data.hasCollectImage
          });
        } else {
          that.setData({
            'collectBackImage': that.data.noCollectImage
          });
        }


      }
    });

  },
  clickSkuValue: function (event) {
    let that = this;
    let functypeId = event.currentTarget.dataset.functypeId;
    let modelId = event.currentTarget.dataset.modelId;
    let dotId = event.currentTarget.dataset.dotId;

    //判断是否可以点击
    let _specificationList = this.data.specificationList;
    let _models = this.data.models;
    let _checkedProductNum = this.data._checkedProductNum;
    let _checkedProductPrice = this.data._checkedProductPrice;
    let _checkedProductDots = this.data._checkedProductDots;

    console.log(_checkedProductDots);
    console.log(modelId+'====='+modelId+'====='+dotId);
    
    let nowClickDot = _specificationList[functypeId].models[modelId].dots[dotId];

    if(!_specificationList[functypeId].checkdotsNum){
        _specificationList[functypeId].checkdotsNum = 0;
    }
    if(nowClickDot.checked){
      _checkedProductPrice = _checkedProductPrice - nowClickDot.price*100
      _checkedProductNum--;
      _specificationList[functypeId].models[modelId].dots[dotId].checked = false;
      _specificationList[functypeId].checkdotsNum-- 
      _models[modelId].dots[dotId].checked = false;
      _checkedProductDots.splice(nowClickDot.id,1);
    }else{
      _checkedProductNum++;
      _specificationList[functypeId].checkdotsNum++ 
      _checkedProductPrice = _checkedProductPrice + nowClickDot.price*100
      _specificationList[functypeId].models[modelId].dots[dotId].checked = true;
      _models[modelId].dots[dotId].checked = true;
      _checkedProductDots[nowClickDot.id] = nowClickDot;
    }

    this.setData({
      'specificationList': _specificationList,
      'models': _models,
      '_checkedProductNum': _checkedProductNum,
      '_checkedProductPrice': _checkedProductPrice,
      '_checkedProductDots': _checkedProductDots,
    });
    //重新计算spec改变后的信息
    // this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },

  //获取选中的规格信息
  getCheckedSpecValue: function () {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        nameId: _specificationList[i].specification_id,
        valueId: 0,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;

  },
  //根据已选的值，计算其它值的状态
  setSpecValueStatus: function () {

  },
  //判断规格是否选择完整
  isCheckedAllSpec: function () {
    return !this.getCheckedSpecValue().some(function (v) {
      if (v.valueId == 0) {
        return true;
      }
    });
  },
  getCheckedSpecKey: function () {
    let checkedValue = this.getCheckedSpecValue().map(function (v) {
      return v.valueId;
    });

    return checkedValue.join('_');
  },
  changeSpecInfo: function () {
    let checkedNameValue = this.getCheckedSpecValue();

    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function (v) {
      if (v.valueId != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function (v) {
      return v.valueText;
    });
    if (checkedValue.length > 0) {
      this.setData({
        'checkedSpecText': checkedValue.join('　')
      });
    } else {
      this.setData({
        'checkedSpecText': '请选择规格数量'
      });
    }

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: parseInt(options.id)
      // id: 1181000
    });
    var that = this;
    this.getGoodsInfo();
    util.request(api.CartGoodsCount).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          cartGoodsCount: res.data.cartTotal.goodsCount
        });

      }
    });
  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  switchAttrPop: function (event) {
    let currentModels = event.currentTarget.dataset.models;
    if (this.data.openAttr == false) {
      this.setData({
        models: currentModels,
        openAttr: !this.data.openAttr
      });
    }
  },
  closeAttr: function () {
    this.setData({
      openAttr: false,
    });
  },
  // 取消收藏
  addCannelCollect: function () {
    
  },

  openCartPage: function () {
    wx.switchTab({
      url: '/pages/cart/cart',
    });
  },
  addToCart: function () {
    
  }
})