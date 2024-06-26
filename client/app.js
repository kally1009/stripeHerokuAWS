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
        cart_empty:"The cart is empty",
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

        postPrice: function(){
            var line_items=[];
            var success_images=[];
            var sendObj = {};
            var Obj1={};
            var Obj2={};
                //loop through for each object in the cart.
                this.cart.forEach((product,index)=>{
                  Obj1 = {
                        price: product.priceId,
                        quantity: 1
                   },
                   Obj2 = {
                       image: product.image,
                       bigURL: product.bigImage,
                   }
                   line_items.push(Obj1);
                   success_images.push(Obj2);

                }),
                sendObj={
                    lineItems:line_items,
                    successImages: success_images,
                }

            fetch(`${url}/create-checkout-session`,{
                method: "POST",
                headers:{
                    "content-type":"application/json"

                },
                body: JSON.stringify(sendObj)
            }).then(function (response){
                response.json().then(function (responseData){
                    if (responseData.url){
                        window.location = responseData.url;
                    }
                })
            })
        },

        searchProducts: function(){
            var product_array = []
            var searchString=this.searchString;
            searchString = searchString.trim().toLowerCase();
            this.category_products.forEach(function(item){

                if(item.name.toLowerCase().indexOf(searchString)!==-1){
                    console.log(item.title)
                    product_array.push(item)
                }
                else if(item.description.toLowerCase().indexOf(searchString)!==-1){
                    product_array.push(item)
                }

            })
            app.category_products=product_array;
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
