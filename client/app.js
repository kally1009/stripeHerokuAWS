var url = "https://naturistic.herokuapp.com"
// var selected_category = "Highlights"
var app = new Vue({
    el: "#app",
    data: {
        dialog: false,
        active: false,
        searchString:"",
        selected_category:"Highlights",
        search_string:"",
        page:"home",
        category_products:[],
        cart:[

        ],
        products: [

        ],
        categories:[
            "Highlights",
            "Water",
            "Mountains",
            "Space",
            "Trees",
            "Desert",
            "Sunsets",
            "Flowers"
        ],

    },
    vuetify: new Vuetify(),

    created: function(){
      this.getProducts();
//      this.filteredCategory();
    },

    methods:{

        getProducts: function(){
            fetch(`${url}/prices`).then(function(response){
                response.json().then(function(data){
                    if(data){
                        app.products=data;
                        app.category_products = app.products;
                    }
                })
            })
        },

        postPrice: ()=>{
            var line_items=[
              {
                price: 'price_1JHt7GA3XQh5RBbNtjzzUz7C',
                quantity: 1
              },
              {
                price: 'price_1JHt6YA3XQh5RBbNYzGU75g6',
                quantity: 1
              }
            ]
                //loop through for each object in the cart.
//                this.cart.forEach((product,index)=>{
//                    var price=product.price
//                    let Obj = {
//                        price: price,
//                        quantity: 1
//                    }
//                    line_items.push(Obj);
//                }),

            fetch(`${url}/create-checkout-session`,{
                method: "POST",
                headers:{
                    "content-type":"application/json"
                },
                body: JSON.stringify(line_items)
            })
        },

        searchProducts: function(){
            var product_array = []
            var searchString=this.searchString;
            searchString = searchString.trim().toLowerCase();

            this.category_products.forEach(function(item){

                if(item.title.toLowerCase().indexOf(searchString)!==-1){
                    console.log(item.title)
                    product_array.push(item)
                }
                else if(item.description.toLowerCase().indexOf(searchString)!==-1){
                    product_array.push(item)
                }

            })
            app.category_products=product_array;
            console.log(app.category_products);
            this.searchString="";
            searchString="";

        },

        addToCart: function(product){
            app.cart.push(product);
        },

        deleteFromCart: function(index){
            app.cart.splice(index,1);
        },

        filteredCategory:  function (selected_category)   {

            if (selected_category === undefined) {
              console.log("setting selected category to HIGHLIGHTS");
              selected_category = "Highlights";
            }

            if(selected_category=="Highlights"){
                this.category_products=app.products
            }
            else{
                    this.category_products=[]

                    this.products.forEach((product,index)=>{
                      if (product.tags) {
                        product.tags.filter((tag) =>{

                          if(tag == selected_category){
                              this.category_products.push(product);
                          }

                        })
                      }
                    })
             }

           },

         }

    });
