const URLCategory = "https://tococlothes.onrender.com/v1/categories";
const URLProduct = "https://tococlothes.onrender.com/v1/products";
const URLSupplier = "https://tococlothes.onrender.com/v1/suppliers";
const URLOrder = "https://tococlothes.onrender.com/v1/orders";
const URLCustomer = "https://tococlothes.onrender.com/v1/customers";
const URLEmployee = "https://tococlothes.onrender.com/v1/employees";
const URLSlides = "https://tococlothes.onrender.com/v1/slides";
const URLTransportation = "https://tococlothes.onrender.com/v1/transportations";
const URLLogin = "https://tococlothes.onrender.com/v1/auth";
const WEB_SERVER_UPLOAD_URL = "https://tococlothes.onrender.com/uploads";
const PATH_CATEGORIES = "/categories";
const URLQLLogin = "https://tococlothes.onrender.com/v1/login";
const ICON_NoImage = "./images/logo_toCoShop.png";
const dateFormatList = ["DD-MM-YYYY", "DD-MM-YY"];
const sizeList = ["S", "M", "L", "XL", "XXL"];
const genderList = ["NAM", "NỮ", "KHÔNG XÁC ĐỊNH"];
const colorList = ["Xanh Navy", "Vàng", "Xám", "Đen", "Hồng", "Trắng"];
const paymentMethodList = ["CREDIT CARD", "COD"];
const statusList = ["WAITING", "SHIPPING", "COMPLETED", "CANCELED"];
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
  paymentMethodList,
  statusList
};
