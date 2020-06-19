function addBasket(e) {
    var bikeName = e.target.id;
    var amount = document.getElementById(e.target.id + " nr").value;
    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;

    var item = [bikeName, amount, startDate, endDate];

    localStorage.setItem(bikeName, item);
    localStorage.getItem(bikeName);
}