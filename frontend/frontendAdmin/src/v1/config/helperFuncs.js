import moment from "moment";


export const customDisabledDate = (current, checkingDate) => {
    return current < moment(checkingDate);
  };