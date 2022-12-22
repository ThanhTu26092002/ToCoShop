export default function formattedDate(date) {
  let array1 = date.split("T");
  let array2 = array1[0].split("-");
  let array3 = array2.reverse();
  return array3.join("-");
}
