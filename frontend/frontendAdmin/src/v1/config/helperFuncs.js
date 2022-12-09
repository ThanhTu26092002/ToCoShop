import moment from "moment";
const payload = localStorage.getItem('auth-toCoShop'); 
  // payload là  chuỗi String, phải chuyển thành Object rồi mới lấy ra
  // convert type of payload: from STRING to OBJECT
  const convertedPayload = JSON.parse(payload)
  // Lấy ra từng phần nhỏ trong Object
  const employeeInfo= convertedPayload.state.auth.employeeInfo

export const customDisabledDate = (current, checkingDate) => {
    return current < moment(checkingDate);
  };

export  const customCreateAHandler= (actionContent)=>{
  const userId = employeeInfo._id;
  const nameUser = employeeInfo.firstName+ ' ' + employeeInfo.lastName;
  const currentTime =moment().format('DD-MM-YYY- HH:mm')
  const action = `Thời gian: ${currentTime} : ${actionContent}`
  const handler = {userId, nameUser, action}
  return handler;
    }
  