function getFilterSlug(curid){
	var curregx = /-/;
	var dashpos = curid.search(curregx);
	return curid.substring(0,dashpos);
}

function getInner(curid){
	var curregx = /duration-inner/;
	var dashpos = curid.search(curregx);
	return dashpos > -1;
}

function filterResults(type){
	var filters = new Array();
	var filtered = new Array();
	var numberperrow = 4;
	if(type == "item"){
		var fullobj = 'ul.itemlist li.full-item';
		var filterobj = 'ul.itemlist li.filter-';
		var visibleobj = 'ul.itemlist li:visible.filter-';
		filters.push("countries"); filters.push("trades");filters.push("communities");
	}
	else if(type == "product"){
		var fullobj = '.category-product';
		var filterobj = '.category-product.filter-';
		var visibleobj = 'div:visible.category-product.filter-';
		filters.push("price"); filters.push("coffeeregions"); 
	}
	
	// turn everybody off = initiate
	$(fullobj).hide();
	$('#noneavail').hide();
	
	
	// debug only 
	//$('div.debug').html('');
	// check to see which filters are NOT set to all, put them in filtered
	for( var i in filters){
		if( !$('a.filter-checkbox#'+filters[i]+'-all' ).hasClass("ischecked") ){
			filtered.push(filters[i]);
			//$('div.debug').append('filtering for: '+filters[i]);
			//$('div.debug').append('<br />');
		}				  
	}
	//$('div.heading').append('<br />');
	
	if( filtered.length == 0 ){  // no filters are on, better show everybody!
		$(fullobj).show();
	}
	else {
		// with only the filtered categories, filter away
		for (var j in filtered){
			if (j == 0){
				$('a.filter-checkbox.ischecked[id^='+filtered[j]+']').each(function(){
	//				$('.frame:visible').not('.'+$(this).attr("id")).hide();
					if(filtered[j] == "price"){
						
						// for price, we need to see if the price is under the max price
						var maxprice = $(this).attr("id");
						maxprice = parseInt(maxprice.replace("price-",""));
						
						$(fullobj).each(function(){
							var classList =$(this).attr('class').split(/\s+/);
							var isunderprice = false;
							$.each( classList, function(index, testclass){
								if(testclass.length > 13){
									if (testclass.substr(0,13) =='filter-price-') {
									   var theprice = parseInt(testclass.replace("filter-price-",""));
									   if(theprice <= maxprice){
											isunderprice = true;   
									   }
									   return false; // break out of each
									}
								}
							});
							
							if(isunderprice){
								$(this).show();	
							}
						});
						
					}
					else{
						$(filterobj+$(this).attr("id")).show();
					}
					//$('div.debug').append('subcats: '+$(this).attr("id"));
					//$('div.debug').append('<br />');
		
				});
			}
			else{
				$('a.filter-checkbox[id^='+filtered[j]+']').not('.ischecked').each(function(){
					$(visibleobj+$(this).attr("id")).hide();
					//$('div.debug').append('hiding: '+$(this).attr("id"));
					//$('div.debug').append('<br />');
		
				});
			}
		}
		
		// if no trips are showing, better let the user know
		if( !$(fullobj).is(":visible") ){
			$('#noneavail').show();
		}
		
		
	}
	
	// better add the last in row class to the newly updated batch (only the visible ones)
	
	$(fullobj+'.last').removeClass("last");
	$(fullobj+':visible').each(function (i) {
		if ((i+1) % numberperrow == 0) $(this).addClass('last');
	});

}

function querySt(ji) {
hu = window.location.search.substring(1);
gy = hu.split("&");
	for (i=0;i<gy.length;i++) {
		ft = gy[i].split("=");
		if (ft[0] == ji) {
			return ft[1];
		}
	}
}

$(document).ready(function() {
   	if(querySt('filter-artisans')){
		filterResults("product");
	}
    $('a.filter-checkbox').click(function(){ 
			var curfiltertype = "item";
			if($(this).hasClass("filter-type-product")){
				curfiltertype = "product";	
			}
			
			var curid = $(this).attr("id");
			var curslug = getFilterSlug(curid);
			var isInner = getInner(curid);
			if( $(this).hasClass("ischecked") ){ // check it OFF
			
				if( curid == curslug+'-all'){	// uncheck the ALL 
					$('a.filter-checkbox[id^='+curslug+']').addClass("ischecked");
					$('a.filter-checkbox[id^='+curslug+']').next('span').addClass("isdark");
					$(this).removeClass("ischecked");
					$(this).next('span').removeClass("isdark");
				}
				else{	// uncheck one inside a category
					$(this).removeClass("ischecked");
					$(this).next('span').removeClass("isdark");
					if(isInner){ // uncheck all children of the inner
						$(this).next().next().next('.inner').children('a.filter-checkbox').removeClass("ischecked");		
						$(this).next().next().next('.inner').children('span').removeClass("isdark");		
					}
					if( !$('a.filter-checkbox[id^='+curslug+']').hasClass("ischecked")){  // none are checked, better recheck the ALL
						$('a.filter-checkbox#'+curslug+'-all').addClass("ischecked");
						$('a.filter-checkbox#'+curslug+'-all').next('span').addClass("isdark");
					}
					
				}
			
			}
			else{	// check it ON
				
				if( curid == curslug+'-all'){	// checked the ALL 
					$('a.filter-checkbox[id^='+curslug+']').removeClass("ischecked");
					$('a.filter-checkbox[id^='+curslug+']').next('span').removeClass("isdark");
					$(this).addClass("ischecked");
					$(this).next('span').addClass("isdark");
				}
				else{	// checked one inside a category
					$('a.filter-checkbox#'+curslug+'-all').removeClass("ischecked"); // uncheck the ALL first
					$('a.filter-checkbox#'+curslug+'-all').next('span').removeClass("isdark");
					$(this).addClass("ischecked");
					$(this).next('span').addClass("isdark");
					$('.frame.'+curid).show();
					
					if(isInner){ // uncheck all children of the inner
						$(this).next().next().next('.inner').children('a.filter-checkbox').addClass("ischecked");		
						$(this).next().next().next('.inner').children('span').addClass("isdark");		
					}

				}
			
			}
			
			// now that every check has the correct state, let's filter.
			filterResults(curfiltertype);
			
			return false;
				
    	});
	
});