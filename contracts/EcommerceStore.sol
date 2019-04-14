pragma solidity ^0.5.0;

contract EcommerceStore {
    uint productIndex;
    enum ProductStatus { Open, Sold, Unsold }
    enum ProductCondition {New, Old }
    mapping (address => mapping(uint => Product)) stores;
    mapping (uint => address) productIdInStore;
    
    struct Product {
        //商品基本信息
        uint id;                    //商品编号，全局递增
        string name;                //商品名称
        string category;            //商品类别
        string imageLink;           //商品图片链接地址
        string descLink;            //商品描述链接地址
        //拍卖相关信息
        uint auctionStartTime;      //拍卖开始时间   
        uint auctionEndTime;        //拍卖截止时间
        uint startPrice;            //起拍价格
        address highestBidder;      //出最高价者 
        uint highestBid;            //最高出价
        uint secondHighestBid;      //次高出价 
        uint totalBids;             //投标者人数
        //商品状态
        ProductStatus status;       //商品销售状态：拍卖中、售出、未售
        ProductCondition condition; //品相：新品、二手  
    }
    
    constructor() public { 
        productIndex = 0; 
    }
    
    function addProductToStore(
        string memory  _name,           //Product.name - 商品名称
        string memory _category,       //Product.category - 商品类别
        string memory _imageLink,      //Product.imageLink - 商品图片链接
        string memory _descLink,       //Product.descLink - 商品描述文本链接
        uint _auctionStartTime, //Product.auctionStartTime - 拍卖开始时间
        uint _auctionEndTime,   //Product.auctionEndTime - 拍卖截止时间
        uint _startPrice,       //Product.startPrice - 起拍价格 
        uint _productCondition  //Product.productCondition - 商品品相
    ) public {
        require (_auctionStartTime < _auctionEndTime);
        //商品编号计数器递增
        productIndex += 1;
        //构造Product结构变量
        Product memory product = Product(productIndex, _name, _category, _imageLink, 
                            _descLink, _auctionStartTime, _auctionEndTime,
                            _startPrice, address(0), 0, 0, 0, ProductStatus.Open, 
                            ProductCondition(_productCondition));
        //存入商品目录表                   
        stores[msg.sender][productIndex] = product;
        //保存商品反查表
        productIdInStore[productIndex] = msg.sender;
    }
    function getProduct(uint _productId) view public 
        returns (uint, string memory , string memory, string memory, string memory, uint, uint, uint, ProductStatus, ProductCondition) {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        //按照定义的先后顺序依次返回product结构各成员
        return (product.id, product.name, product.category, product.imageLink, 
            product.descLink, product.auctionStartTime,
            product.auctionEndTime, product.startPrice, product.status, product.condition);
    }
}