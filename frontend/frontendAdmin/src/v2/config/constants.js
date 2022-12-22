const URLCategory = "http://localhost:9000/v1/categories";
const URLProduct = "http://localhost:9000/v1/products";
const URLSupplier = "http://localhost:9000/v1/suppliers";
const URLOrder = "http://localhost:9000/v1/orders";
const URLCustomer = "http://localhost:9000/v1/customers";
const URLEmployee = "http://localhost:9000/v1/employees";
const URLSlides = "http://localhost:9000/v1/slides";
const URLTransportation = "http://localhost:9000/v1/transportations";
const URLLogin = "http://localhost:9000/v1/auth";
const WEB_SERVER_UPLOAD_URL = "http://localhost:9000/uploads";
const PATH_CATEGORIES = "/categories";
const URLQLLogin = "http://localhost:9000/v1/login";
const ICON_NoImage = "./images/logo_toCoShop.png";
const dateFormatList = ["DD-MM-YYYY", "DD-MM-YY"];
const sizeList = ["S", "M", "L", "XL", "XXL"];
const genderList = ["NAM", "NỮ", "KHÔNG XÁC ĐỊNH"];
const colorList = ["Xanh Navy", "Vàng", "Xám", "Đen", "Hồng", "Trắng"];

const promotionPositionOptions = [
  {
    label: "Gợi ý trong tuần",
    value: "WEEKLY",
  },
  {
    label: "Outfit Mùa Hè",
    value: "muahe",
  },
  {
    label: "Outfit Mùa thu",
    value: "muathu",
  },
  {
    label: "Outfit Mùa xuân",
    value: "muaxuan",
  },
  {
    label: "Outfit Mùa đông",
    value: "muadong",
  },
];

module.exports = {
  URLCategory,
  URLSupplier,
  URLCustomer,
  URLEmployee,
  URLOrder,
  URLProduct,
  URLLogin,
  URLTransportation,
  WEB_SERVER_UPLOAD_URL,
  PATH_CATEGORIES,
  ICON_NoImage,
  URLSlides,
  dateFormatList,
  sizeList,
  colorList,
  genderList,
  URLQLLogin,
  promotionPositionOptions,
};
