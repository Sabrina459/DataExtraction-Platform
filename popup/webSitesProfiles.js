export const profiles={
    "homepharma.shop": {
        categoryNameSelector:".last_bc_item",
        productListId: "#catalog_block",
        productListSelector: "#catalog_block",
        productItemSelector:".product_slider_wr ",
        fields: {
            title: ".product_slider_title",
            mainPrice: ".current_price",
            oldPrice:".old_price",
            image: {
                selector: ".product_slider_img",
                type: "image" // extract URL from background-image. Can have attribute field
            },
            articule: ".articul",
            notStock: ".not_in_stock",
            url: {
                selector:"a",
                attribute: "href"
            }
        }
    },
    "meda.com.ua": {
        categoryNameSelector:"h1",
        productListId: "#fn_products_content",
        productListSelector: ".products_list",
        productItemSelector:".product_item",
        fields: {
            title: ".product_preview__name_link",
            mainPrice: ".details_boxed__price",
            oldPrice:".details_boxed__old_price ",
            image: {
                selector: ".fn_img.preview_img.lazy.loaded",
                type: "image" // extract URL from background-image. Can have attribute field
            },
            brand: ".product_preview__brand",
            
            inStock: ".fn_not_preorder.hidden-xs-up ",
            url: {
                selector:"a",
                attribute: "href"
            }
        }
    }
}