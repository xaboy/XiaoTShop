<?php
/**
 * sqc @小T科技 2018.03.06
 *
 *
 */
namespace App\Logic;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Resources\ShopCart as ShopCartResource;
use App\Models\ShopCart;


class CartLogic
{
    public function __construct()
    {

    }

    static public function addCart($goodsInfo, $number, $type = 0)
    {
        if (empty(\Auth::user()->id)) {
            $user_id = 0;
        } else {
            $user_id = \Auth::user()->id;
        }

        $newCart = new ShopCart();
        $info = $newCart->where(['goods_id' => $goodsInfo->id])->first();
        if (!empty($info->goods_id)) {
            $info->number = $info->number + $number;
            // 库存超额判断
            if ($info->number > $goodsInfo->goods_number) {
                $info->number = $goodsInfo->goods_number;
            }
            return $info->save();
        }
        $newCart->uid = $user_id;
        $newCart->goods_id = $goodsInfo->id;
        $newCart->goods_sn = $goodsInfo->goods_sn;
        $newCart->goods_name = $goodsInfo->goods_name;
        $newCart->market_price = $goodsInfo->counter_price;
        $newCart->retail_price = $goodsInfo->retail_price;
        $newCart->number = $number;
        $newCart->list_pic_url = $goodsInfo->primary_pic_url;
        return $newCart->save();
    }

    // 获取购物车列表
    public static function getCartList($where)
    {
        $list = ShopCart::where($where)->get();
        $outData['cartList'] = ShopCartResource::collection($list);
        $outData['cartTotal']['checkedGoodsCount'] = ShopCart::getGoodsCount($where);
        $outData['cartTotal']['checkedGoodsAmount'] = ShopCart::getGoodsAmountCount($where);
        return $outData;
    }

    public static function getCheckedGoodsList($uid)
    {
        $cartList = ShopCart::getCheckedGoodsList($uid);
        $checkedGoodsList = ShopCartResource::collection($cartList);
        $goodsTotalPrice = array_sum(array_pluck($checkedGoodsList, 'retail_price'));
        $freightPrice = array_sum(array_pluck($checkedGoodsList, 'freight_price'));
        return [
            'checkedGoodsList' => $checkedGoodsList,// 商品列表
            'goodsTotalPrice' => $goodsTotalPrice,// 商品总价格
            'freightPrice' => $freightPrice,// 商品运费总和
            'orderTotalPrice' => PriceCalculate($goodsTotalPrice,'+',$freightPrice)
        ];
    }

    // 清空购物车
    public static function clearCart($uid){
        return ShopCart::where([
            'uid' => $uid,
            'checked'=> ShopCart::STATE_CHECKED
        ])->delete();
    }

}
