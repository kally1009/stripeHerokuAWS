var url = "https://naturistic-demo.herokuapp.com"
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
            {
                title:"Ocean Water",
                bigImage:"",
                image:"./images/wave.jpg",
                description:"Ocean Water and waves in Southern California. Photo by Lorem Ipsum",
                tags:["Water"],
                price:1.00

            },
            {
                title:"Water Fall",
                bigImage:"",
                image:"./images/waterfall.jpg",
                description:"The mystical falls in Niagra, Niagra Falls.",
                tags: ["Water"],
                price: 2.00

            },
            {
                title:"Snowy Trees",
                bigImage:"",
                image:"./images/sun_snow.jpg",
                description:"Trees and Snow in Halifax Canada during the winter.",
                tags: ["Trees"],
                price: 1.00

            },
            {
                title:"Sunset Mountain",
                bigImage:"",
                image:"./images/sun_mountain.jpg",
                description:"Southern Utah sunset with desert mountains",
                tags:["Mountains","Sunsets", "Desert"],
                price: 2.00

            },
            {
                title:"Snow Mountains",
                bigImage:"",
                description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                image:"./images/snow_mountain1.jpg",
                description:"Desert Mountain",
                tags:["Mountains"],
                price: 1.00

            },
            {
                title:"Underwater",
                bigImage:"",
                image:"./images/splashing.jpg",
                description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                tags:["Water"],
                price: 1.00

            },
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
        ]

    },
    vuetify: new Vuetify(),
    created: function(){
      this.getProducts();
      this.filteredCategory();
    },
    methods:{
        getProducts: function(){
            fetch(`${url}/prices`).then(function(response){
                response.json().then(function(data){
                    console.log(data);
                    if(data){
                        app.products=data;
                    }
                })
            })
        },
        postPrice: function(price){
            line_items: [
                //loop through for each object in the cart.
                {
                    price: price,
                    quantity: 1
                }
            ]
            fetch(`${url}/create-checkout-session`,{
                method: "POST",
                headers:{
                    "content-type":"application/json"
                },
                body: JSON.stringify(line_items)
            }).then(function(response){
                console.log(price)
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
            console.log(app.cart);
        },
        deleteFromCart: function(index){
            app.cart.splice(index,1);
            console.log(app.cart);
        },
        filteredCategory: function(){
            if(this.selected_category=="Highlights"){
                this.category_products=this.products
               // return this.category_products;
            }
            else{
                    this.category_products=[]
                    this.products.forEach(function(product,index){
                    product.tags.filter(function(tag){
                        if(tag == app.selected_category){
                            app.category_products.push(product);
                            console.log(product, tag);
                        }
                    })
                })
               // return this.category_products;

            }

        }
    }
    });
