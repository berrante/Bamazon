//Required
const inquirer = require('inquirer');
const mysql = require('mysql');
let updateQuant;

//Connect to database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'Bamazon'
});

//Connect to MySQL
connection.connect(function(err) {

      if(err) throw err;

      displayItems();
});

//displaying items for sale
function displayItems(){
  connection.query("SELECT * FROM products", function(err,res){

    if (err) throw err;
           for (var i = 0; i < res.length; i++) {
            //  itemNumber++
             console.log(
               "Item #" + res[i].item_id,
               "Product Name:" + res[i].product_name,
               "Price: $" + res[i].price
             );
           }

           //questions
           questions();
    })
}

function questions() {
  connection.query("SELECT * FROM products", function(err,res){
    if (err) throw err;

  inquirer
    .prompt([
      {
      name: "idNo",
      type: "rawlist",
      choices: function() {
				let choiceArray = [];
				for(var i = 0; i < res.length; i++) {
					choiceArray.push(res[i].product_name);
				}
				return choiceArray;
			},
      message: "Select the product you want to buy."
    },
    {
      name: "noOfItem",
      type: "input",
      message: "Please enter quantity."
    }
  ])

    .then(function(answer) {

        let chosenItem;
            for (var i = 0; i < res.length; i++) {
              if (res[i].product_name === answer.idNo) {
                chosenItem = res[i];
              }
            }

        let answerQuant = parseInt(answer.noOfItem)
        let stockQuant = parseInt(chosenItem.stock_quantity)
        let productId = parseInt(chosenItem.item_id)
        let productName = (chosenItem.product_name)
        let updateQuant = stockQuant - answerQuant

              if (answerQuant > stockQuant)
                  {
                        console.log("Insufficient Quantity!")
                        questions();
                  }
                  else if (answerQuant <= stockQuant){

                        updateDatabase(productId,updateQuant,answerQuant, productName);

                  }
                  else {
                        console.log("Ran to end of function.")
                        questions();
                  }
    });
  });
};

function updateDatabase(productId, updateQuant, answerQuant, productName) {
  connection.query(
    "UPDATE products SET stock_quantity = ? WHERE item_id = ?",
    [updateQuant, productId],
    function(err, res) {
      // Let the user know the purchase was successful, re-run loadProducts
      console.log("\nSuccessfully purchased " + answerQuant + " " + productName + "'s!");
      displayItems();
    }
  );
}
