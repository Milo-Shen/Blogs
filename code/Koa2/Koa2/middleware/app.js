fetch('https://qa-dz-mall.blz.netease.com/action/order/secondary-currency-purchase', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    cache: false,
    credentials: 'include',
    body: 'amount=1&currency=gold&hash=5df72d734e6222cba3614cdffff23305&productSku=10001010201000101021'
});