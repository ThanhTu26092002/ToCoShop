const URLCategory = 'http://localhost:9000/v1/categories';
const URLProduct = 'http://localhost:9000/v1/products';
const URLSupplier = 'http://localhost:9000/v1/suppliers';
const URLOrder = 'http://localhost:9000/v1/orders';
const URLCustomer = 'http://localhost:9000/v1/customers';
const URLEmployee = 'http://localhost:9000/v1/employees';
const URLSlides = 'http://localhost:9000/v1/slides';
const URLTransportation = 'http://localhost:9000/v1/transportations';
const URLLogin = 'http://localhost:9000/v1/auth'
const WEB_SERVER_UPLOAD_URL = 'http://localhost:9000/uploads'
const PATH_CATEGORIES = '/categories'

const ICON_NoImage = "./images/logo_toCoShop.png";
const dateFormatList = ["DD-MM-YYYY", "DD-MM-YY"];
const sizeList =['S', 'M', 'L', 'XL', 'XXL']


module.exports= {
    URLCategory, URLSupplier, URLCustomer,
    URLEmployee, URLOrder, URLProduct,
    URLLogin,
    URLTransportation,
    WEB_SERVER_UPLOAD_URL,
    PATH_CATEGORIES,
    ICON_NoImage,
    URLSlides,
    dateFormatList,
    sizeList
}