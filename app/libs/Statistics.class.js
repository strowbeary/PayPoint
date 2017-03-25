class Statistics {

    constructor() {

    }
    static exportLogs() {

    }

    static getTotalSales(from, to, cb) {

        var dateFrom = new Date(parseInt(from));
        var dateTo = new Date(parseInt(to));
        var search = {};
        if(typeof from === "object"){
            search = {
                $and: [
                    {timestamp: {$lte: dateFrom.getTime()}},
                    {timestamp: {$gte: dateTo.getTime()}}
                ]
            }
        }
        commandDb.find(search, function (err, commands) {
            database = JSON.parse(fs.readFileSync("./database.json", "UTF-8"));

            let add = {
                HT: 0,
                TTC: 0,
                perTVARate: {
                    "5,5": 0,
                    "10": 0,
                    "20": 0
                },
                perCategories: new Map(),
                perPaymentMethods: {
                    check: 0,
                    cash: 0
                }
            };
            for (let command of commands) {
                let commandDate = new Date(command.timestamp);
                if ((commandDate.getTime() <= dateTo.getTime()) && (commandDate.getTime() >= dateFrom.getTime())) {
                    add.HT += command.total.HT;
                    add.TTC += command.total.TTC;
                    add.perTVARate["5,5"] += command.total.perTVARate["5,5"];
                    add.perTVARate["10"] += command.total.perTVARate["10"];
                    add.perTVARate["20"] += command.total.perTVARate["20"];
                    add.perPaymentMethods.check += command.payment.methods.check;
                    add.perPaymentMethods.cash += command.payment.methods.cash;

                for(let product of command.products){
                	    if(typeof add.perCategories.get(product.category) === "undefined"){
                	        add.perCategories.set(product.category, {
                                "5,5": 0,
                                "10": 0,
                                "20": 0
                            });
               	     }
                	    add.perCategories.get(product.category)[product.TVARate.toString().replace(".", ",")] += product.price * product.qts;
                	}
		}
            }
            add.HT = parseFloat(parseFloat(add.HT).toFixed(2));
            add.TTC = parseFloat(parseFloat(add.TTC).toFixed(2));
            add.perTVARate["5,5"] = parseFloat(parseFloat(add.perTVARate["5,5"]).toFixed(2));
            add.perTVARate["10"] = parseFloat(parseFloat(add.perTVARate["10"]).toFixed(2));
            add.perTVARate["20"] = parseFloat(parseFloat(add.perTVARate["20"]).toFixed(2));

            cb(add, commands);
        });
    }

    static getSalesPerProducts(from, to, cb) {
        var dateFrom = new Date(parseInt(from));
        var dateTo = new Date(parseInt(to));
        var search = {};
        if(typeof from === "number"){
            search = {
                $and: [
                    {timestamp: {$lte: to}},
                    {timestamp: {$gte: from}}
                ]
            }
        }
        commandDb.find(search, function (err, data) {

            let sales = {
                labels: [],
                values: []
            }
            for (let product of database.products) {
                sales.values.push({
                    product: product.itemId,
                    name: product.name,
                    soldQts: 0,
                    price: product.price
                });
                sales.labels.push(product.name);
            }
            for (let command of data) {
                for (let product of command.products) {
                    let productIndex = sales.labels.indexOf(product.name);
			console.log(productIndex);
                    if (productIndex !== -1) {
                        sales.values[productIndex].soldQts += product.qts;
                    }
                }
            }
	    cb(sales);
        });
        return true;
    }

    static getAccountingDetails(cb){
        cashDrawerDb.find({}, function (err, data) {
            let accountDetails = {
                balance: 0,
                lastDeposit: [],
                operations: []
            }
            if(!err){
                for (let operation of data) {
                    if(operation.operationType == "deposit"){
                        accountDetails.balance -= operation.amount;
                    }else{
                        accountDetails.balance += operation.amount;
                    }
                    accountDetails.operations.push(operation);
                }
                console.info("Details", accountDetails);
                cb(accountDetails);
            }else{
                console.error(err);
            }
        });
    }

}
