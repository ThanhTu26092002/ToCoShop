# ToCoShop
Hai chú xem lướt qua, thắc mắc chỗ nào thì nói mình nhé!
Trước tiên tải về rồi chạy thử GET http://localhost:9000/v1/upload

##
sendingDateState: 2022-12-09
sendingDate(from mongodb): 2022-12-09T00:00:00.000Z
sendingDate (setField sendingDate in tag DatePicker): Moment {_isAMomentObject: true, _i: '2022-12-09T00:00:00.000Z', _f: 'YYYY-MM-DDTHH:mm:ss.SSSSZ', _tzm: 0, _isUTC: false, …}
### Comparison two objects 
JSON.stringify(test1) === JSON.stringify(test2)

###Simple way to compare ONE-LEVEL only objects.
 Utils.compareObjects = function(o1, o2){
    for(var p in o1){
        if(o1.hasOwnProperty(p)){
            if(o1[p] !== o2[p]){
                return false;
            }
        }
    }
    for(var p in o2){
        if(o2.hasOwnProperty(p)){
            if(o1[p] !== o2[p]){
                return false;
            }
        }
    }
    return true;
};
### Compare two object more deeply https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript

### Compare two arrays
function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}