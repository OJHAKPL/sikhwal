	$(document).on('pagebeforecreate', '[data-role="page"]', function() {
		loading('show', 1);
	});
	 
	$(document).on('pageshow', '[data-role="page"]', function() {
		loading('hide', 1000);
	});
	 
	function loading(showOrHide, delay) {
	  setTimeout(function() {
			$.mobile.loading(showOrHide);
	  }, delay);
	}
	
	/*--------- Login -----------*/  
	function homeLogin() {
		$.post(
		"http://192.168.1.5/nd2no/admin/web-login",
		{
		  email: $("#login-email").val(),
		  password: $("#login-password").val()
		},
		function(data,status){
			var dataArray = jQuery.parseJSON(data);
			var htmlStr='';
			$.each(dataArray, function(i, field){
				if(field.email){
					if($('#keep_me_login').is(":checked")) {
						localStorage.setItem('email', field.email);
						localStorage.setItem('userid', field.id);
					} else {
						localStorage.setItem('userid-2', field.id);
					}				
					cardlist();
				} else {
					if(dataArray.error){
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(dataArray.error);
						setTimeout(function() {
						$('.errorMsgShow').hide();
						}, 3000);
					}		
				}					
			});					
		});
	}
	
	
	
	/*---------- Display cards in folder ----------*/
	function showFoldercards(folderId,folderName) {
		
		$('.myfolderDetailsHtml').empty();
		$('.folderviewloder').show();
	 	
		$.mobile.changePage("#folder-cards",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
		$("#folderTitle").text(folderName);
		$.post(
			"http://192.168.1.5/nd2no/admin/web-folder-cards",
			{
			  folder_id: folderId,
			},
			function(cardlist,status){
				var cardlistArr = jQuery.parseJSON(cardlist);
				var folderName='';
				if(!cardlistArr.error) {
					$.each( cardlistArr, function(i, row1) {
						$.each( row1, function(i, row) {
							folderName = row.folder_name;
							/*----------- card image check --------*/
							var cardImages = (row.banner)?row.banner:'';
							if(cardImages){
								var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
								var image = new Image(); 
								image.src = cardImages;
								if(image.height == 0) {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
							} else {
								var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
							}
							$('.myfolderDetailsHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="images/tick-icon-black.png" alt=""></a> <a href="javascript:void(0);" onClick="deleteMyfolder('+row.card_shared_id+')" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
						});
					});
					$('.folderviewloder').hide();
				} else {	
					$('.folderviewloder').hide();
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);						
				}
			}
		) 
	}
	
	
	function deleteMyfolder(card_shared_id){
		
		$.post(
			"http://192.168.1.5/nd2no/admin/web-folder-delete",
			{
				shared_id: card_shared_id,
			},
			function(result, status){
				var resultArr = jQuery.parseJSON(result);
				if(resultArr.success){
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("error");
					$(".errorMsgShow").addClass("success");
					$(".errorMsgShow").text(resultArr.success); 
					showFoldercards(resultArr.folder_id,resultArr.folder_name);					
				} else {						
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(resultArr.error);						
				}
			}
		) 
	}


	/*----------- card details from notification----------*/
	function cartDetailsNotification(cardId) {
		
		$.post(
			"http://192.168.1.5/nd2no/admin/web-cards-detail",
			{
			  id: cardId
			},
			function(cardDetails,status){
				
				var iconUrl='';
				var uid='';
				var userRole='';
				var getACard='';
				$('#folder_list').empty();
				var cardDetailsArr = jQuery.parseJSON(cardDetails);
				
				$(".card-link-details>div").empty();
				$(".card-icons").empty();
				$(".allsociallink").empty();
				
				$.each( cardDetailsArr, function(i, firstRow) {	
					iconUrl = firstRow.card.icon_url_path;
					uid = firstRow.card.uid;
					userRole = firstRow.card.role_id;
					getACard = firstRow.card.getacard_icon;
					/*----------- card image check --------*/
					var cardImages = firstRow.card.card_large_image_path+firstRow.card.banner;
					if(cardImages){
						var cardImages = cardImages;
						var image = new Image(); 
						image.src = cardImages;
						if(image.height == 0) {
							var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
						}
					} else {
						var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
					}
					
					$('.card-link-details').append('<input type="hidden" name="sharecard_id" id="sharecard_id" value="'+cardId+'"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><div class="pull-right"><a href="#shareCarddetails" data-rel="popup"><button class="ui-btn ui-shadow ui-corner-all"><img src="images/share-icon.png" alt=""></button></a></div><h3 class="title">'+firstRow.card.title+'</h3></div>');
				});
		
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						if (row2.type=='Business Email'){
							$('.card-icons').append('<a class="ui-link" href="mailto:'+row2.url+'" data-rel="external" ><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else {
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						}
					});
				});
				
				if (userRole == 3 || userRole == 4) {
				$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy-ae/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				} else {
				$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				}
				
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						if (row2.type=='Business Email'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title"><a class="ui-link" href="mailto:'+row2.url+'" data-rel="external"  >'+row2.type+'</a></div></li></ul>');
						} else {
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');" >'+row2.type+'</a></div></li></ul>');
						}
					}); 
				}); 
				
				if (userRole == 3 || userRole == 4) {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy-ae/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				} else {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				}
			
			}
		);
		
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}	
		if(user_id){
			$.post(
				"http://192.168.1.5/nd2no/admin/web-reset-notification",
				{
					card_id: cardId,
					user_id: user_id
				},
				function(result, status){
					
				}
			); 
			$.mobile.changePage("#card-details",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
		} else {
			//$.mobile.changePage("#login");
		}
	}




	/*--------- Shared Card List-----------*/
	function sharedcardlist(){
	    $('.cardsshareHtml').empty();
		$('.foldercardlist').empty();
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$.mobile.changePage("#shared-card-list",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			$('.sharelistloader').show();
			$.post(
				"http://192.168.1.5/nd2no/admin/web-shared-cards",
				{
				  user_id: user_id,
				},
				function(cardlist,status){
					
					var cardlistArr = jQuery.parseJSON(cardlist);
					if(!cardlistArr.error) {
						$.each( cardlistArr, function(i, row1) {
							$.each( row1, function(i, row) {
								
								tickiconImg = 'images/tick-icon-black.png'
								alredyexist = false;
								if(localStorage.cartitem){
									var strVale = localStorage.cartitem;
									arrCheak = strVale.split(',');
									for(i=0; i < arrCheak.length; i++){
										if(arrCheak[i]==row.id){
											alredyexist = true;
										}
									}
								}
								if(alredyexist){
									tickiconImg = 'images/tick-icon-black1.png';
								}
								
								/*----------- card image check --------*/
								var cardImages = (row.banner)?row.banner:'';
								if(cardImages){
									var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
									var image = new Image(); 
									image.src = cardImages;
									if(image.height == 0) {
										var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
									}
								} else {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
								
								$('.cardsshareHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="'+tickiconImg+'" alt=""></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="deleteCard('+row.card_shared_id+');" src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						$('.sharelistloader').hide();
					} else {
						$('.sharelistloader').hide();
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);						
					}
				}
			)
		} else {
			//$.mobile.changePage("#login");
		}
	}
		
	/*---------- Delete shared card ----------*/
	function deleteCard(card_shared_id) { 
		$.post(
			"http://192.168.1.5/nd2no/admin/web-remove-shared-card",
			{
				shared_id: card_shared_id,
			},
			function(result, status){
				$('.cardslistHtml').empty();
				var resultArr = jQuery.parseJSON(result);
				if(resultArr.success){
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("error");
					$(".errorMsgShow").addClass("success");
					$(".errorMsgShow").text(resultArr.success); 
					sharedcardlist()
				}else {						
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(resultArr.error);						
				}
			}
		) 
	}	

	/*---------- Add card to cart ----------*/
	function addCart(cardId) { 

		var srcName = $('.cardclass_'+cardId).attr('src');
		if(srcName=='images/tick-icon-black.png'){
			$('.cardclass_'+cardId).attr('src', 'images/tick-icon-black1.png');
			localStorage.setItem('cardIdValue['+cardId+']', cardId);	
			
			if (!localStorage.cartitem){
				localStorage.cartcount = 1;
				localStorage.cartitem = cardId;
			} else {
				var str2= localStorage.cartitem;
				if (-1 == str2.search(cardId)){
				localStorage.cartcount ++;
				localStorage.cartitem = localStorage.cartitem +',' +cardId;
				} 
			}
				var str= localStorage.cartitem;
				localStorage.cartitem = str.replace(',,', ","); 
		} else {
			$('.cardclass_'+cardId).attr('src', 'images/tick-icon-black.png');
			localStorage.removeItem('cardIdValue['+cardId+']');
				var str= localStorage.cartitem;
				var str1= str.replace(cardId, ""); 
				localStorage.cartitem = str1.replace(',,', ","); 
				localStorage.cartcount --;
				
			}
			
		$('.counter-cardtick').text(localStorage.cartcount);
	}
			
				
	/*---------- Remove card selected ----------*/
	function removeSelected(cardId) {

		var str= localStorage.cartitem;
		var str1= str.replace(cardId, ""); 
		localStorage.cartitem = str1.replace(',,', ","); 
		localStorage.cartcount --;
		
		if (!localStorage.cartitem){
		var items = '';
		} else {
		var items =localStorage.cartitem;
		}

		$.post(
			"http://192.168.1.5/nd2no/admin/web-selected-cards",
			{
			  selected_card_ids: items
			},
			function(cardlist,status){
				$('.ticked-list').empty();
				var cardlistArr = jQuery.parseJSON(cardlist);
			
			
			if(!cardlistArr.error) {
					$.each( cardlistArr, function(i, row1) {
						$.each( row1, function(i, row) {	
							/*----------- card image check --------*/
							var cardImages = (row.banner)?row.banner:'';
							if(cardImages){
								var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
								var image = new Image(); 
								image.src = cardImages;
								if(image.height == 0) {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
							} else {
								var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
							}
							$('.ticked-list').append('<li><div class="card-option"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="removeSelected('+row.id+');" src="images/delete-icon.png" alt=""></a></div><div class="img"><img src="'+cardImages+'" alt=""></div></li>');
						
						});
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);
				}
			}
		)
		
		if (!localStorage.cartcount){
		var itemcount = 0;
		} else {
		var itemcount =localStorage.cartcount;
		}
		$('.counter-cardtick').text(itemcount);
		$.mobile.changePage("#selected-cards",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});

	}


	/*----------- card details ----------*/
	function cartDetails(cardId) {
		$('.cardDetails').show();
		$.post(
			"http://192.168.1.5/nd2no/admin/web-cards-detail",
			{
			  id: cardId
			},
 			function(cardDetails,status){
				var iconUrl='';
				var uid='';
				var userRole='';
				var getACard='';
				$('#folder_list').empty();
				var cardDetailsArr = jQuery.parseJSON(cardDetails);
				
				$(".card-link-details>div").empty();
				$(".card-icons").empty();
				$(".allsociallink").empty();
				
				$.each(cardDetailsArr, function(i, firstRow) {	
					$('.marquee-text').remove();
					$('.main-img').remove();
					marqueeList = '';
					$.each(firstRow.scrollers, function(i, row5) {
						scroll_title = (row5.title)?row5.title:'';
						scroll_url   = (row5.url)?row5.url:'';
						marqueeList += '<a class="ui-link" style="text-decoration: none;" href="javascript:void(0);" onclick="window.open(\''+scroll_url+'\', \'_system\');">'+scroll_title+'</a>&nbsp;&nbsp;';
					});
					if(marqueeList){
						marqueeList = '<div class="marquee-text"><marquee onmouseover="this.setAttribute(\'scrollamount\', 0, 0);" onmouseout="this.setAttribute(\'scrollamount\', 6, 0);" direction="left">'+marqueeList+'</marquee></div>';
					}
					
					iconUrl = firstRow.card.icon_url_path;
					uid = firstRow.card.uid;
					userRole = firstRow.card.role_id;
					getACard = firstRow.card.getacard_icon;
					
					/*----------- card image check --------*/
					var cardImages = firstRow.card.card_large_image_path+firstRow.card.banner;
					if(cardImages){
						var cardImages = cardImages;
						var image = new Image(); 
						image.src = cardImages;
						if(image.height == 0) {
							var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
						}
					} else {
						var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
					}
					
					$('.card-link-details').append('<input type="hidden" name="sharecard_id" id="sharecard_id" value="'+cardId+'"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div>'+marqueeList+'<div class="card-header"><div class="pull-right"><a href="javascript:void(0);" onclick="window.plugins.socialsharing.share(\''+firstRow.card.title+'\', null, \''+cardImages+'\', \''+cardImages+'\')"><button type="button" class="ui-btn ui-shadow ui-corner-all"><img src="images/share-icon.png" alt=""></button></a></div><h3 class="title">'+firstRow.card.title+'</h3></div>');
				});
		
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						if (row2.type=='Business Email'){
							$('.card-icons').append('<a class="ui-link" href="mailto:'+row2.url+'" data-rel="external" ><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else {
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						}
					});
				});
				
				if(userRole == 3 || userRole == 4) {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy-ae/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				} else {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				}
				
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						if (row2.type=='Business Email'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title"><a class="ui-link" href="mailto:'+row2.url+'" data-rel="external"  >'+row2.type+'</a></div></li></ul>');
						} else {
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');" >'+row2.type+'</a></div></li></ul>');
						}
					}); 
				}); 
				
				if (userRole == 3 || userRole == 4) {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy-ae/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				} else {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				}
				$('.cardDetails').hide();
			}
		);
		$.mobile.changePage("#card-details",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
	}



	/*----------- card details ----------*/
	function editCard(cardId){
		$.post(
			"http://192.168.1.5/nd2no/admin/web-update-card",{
				card_id: cardId,
			},
			function(profiledetails, status){
				$('.Allprofileview').empty();
				
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) {
					$.each( profileArr, function(i, row) {
						var title   		= row.card.title;
						/*----------- card image check --------*/
						var cardImages = row.card.card_large_image_path+row.card.banner;
						if(cardImages){
							var cardImages = cardImages;
							var image = new Image(); 
							image.src = cardImages;
							if(image.height == 0) {
								var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
							}
						} else {
							var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
						}
						
						var title_html	= '<div class="ui-input-text ui-body-inherit"><input type="text" value="'+row.card.title+'" id="title" placeholder="Title" name="title"></div>';
						var banner_html	= ''; 
						var editcard='<div class="Allprofileview"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+title+'</h3></div><div style="display: flex; height: 47px;"><a style="width: 50%; text-decoration: none;" title="Card Link" href="javascript:void(0);" onclick="cardLink('+cardId+')" data-rel="popup"><button type="button" class="ui-btn ui-shadow ui-corner-all">Edit Link</button></a><a style="width: 50%; text-decoration: none;" title="Edit Scroller" href="javascript:void(0);" onclick="editscroller('+cardId+')" data-rel="popup"><button type="button" class="ui-btn ui-shadow ui-corner-all">Edit Scroller</button></a></div><form name="edit_card" id="edit_card" enctype="multipart/form-data" method="post"><div class="page-form"><input type="hidden" name="card_id" id="card_id" value="'+cardId+'">'+ title_html + banner_html +'';
					
				 		editcard +='</div><button onClick="EditCardSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Edit Card</button></form></div>';
						$('.updateCard').append(editcard);
					
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
				}
				$.mobile.changePage("#update-card",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			}
		)
	}
	
	
	

	function EditCardSubmit(){

	
		/*--------- Edit Card -----------*/  
		$('#edit_card').validate({
			rules: {
				title: {
					required: true
				}
			},
			messages: {
				title: {
					required: "Please enter title."
				}
			},
			errorPlacement: function (error, element) {
				error.appendTo(element.parent().add());
			},
			submitHandler:function (form) {
			
			var values = {};
			$('input[name^="obj"]').each(function() {
				values[$(this).attr("id")] = ($(this).val());
			
				
			});
			/*
		var values=	$("input[name^='obj']")
              .map(function(){return $(this).val();}).get();
			
			  var values1=	$("input[name^='obj']")
              .map(function(){return $(this).attr("id");}).get();
			alert(values1);*/
	
				$.post(
					"http://192.168.1.5/nd2no/admin/web-update-card",{
						card_id: jQuery('#edit_card').find('input[name="card_id"]').val(),
						title: jQuery('#edit_card').find('input[name="title"]').val(),
						links: values, 
						
					},
					function(registerData){
						var dataMsg = jQuery.parseJSON(registerData);	
						if(dataMsg.error){
							$(".errorMsgShow").show();
							$(".errorMsgShow").removeClass("success");
							$(".errorMsgShow").addClass("error");
							$(".errorMsgShow").text(dataMsg.error);								
							setTimeout(function() {
								$('.errorMsgShow').hide();
							}, 4000);	
							
						}else if(dataMsg.success){
							$(".errorMsgShow").show();
							$(".errorMsgShow").removeClass("error");
							$(".errorMsgShow").addClass("success");
							$(".errorMsgShow").text(dataMsg.success);
							setTimeout(function() {
								$('.errorMsgShow').hide();
							}, 3000);	
							editCard(dataMsg.card_id); 
						}
					}
				)
			}
		});
	}


	function shareEmailCheck(){
		email = $('#share-email').val();
		sharecard_id = $('#sharecard_id').val();
		
		$.post(
			"http://192.168.1.5/nd2no/admin/web-share-cards",
			{
			  email: email,
			  card_id: sharecard_id,
			},
			function(data,status){
				
				localStorage.removeItem('cartitem');
				localStorage.removeItem('cartcount');
				$('.counter-cardtick').text('0');
				
				var dataMsg = jQuery.parseJSON(data);
				if(dataMsg.error){
					$(".errorMsgShow-2").show();
					$(".errorMsgShow-2").removeClass("success");
					$(".errorMsgShow-2").addClass("error");
					$(".errorMsgShow-2").text(dataMsg.error);							
					setTimeout(function() {
						$('.errorMsgShow-2').hide();
					}, 4000);
				}
				if(dataMsg.success){
					$(".errorMsgShow-2").show();
					$(".errorMsgShow-2").removeClass("error");
					$(".errorMsgShow-2").addClass("success");
					$(".errorMsgShow-2").text(dataMsg.success);
					setTimeout(function() {
						$('.errorMsgShow-2').hide();
						$('#share-email').val('');
						$('#shareCarddetails').popup('close');
					}, 4000);	
					 
				}
			}
		);
	}


	function shareEmailCheckMultiple(){
		email = $('#share-email2').val();
		sharecard_id = localStorage.cartitem;			
		
		$.post(
			"http://192.168.1.5/nd2no/admin/web-share-cards",
			{
			  email: email,
			  card_id: sharecard_id,
			},
			function(data,status){				
				localStorage.removeItem('cartitem');
				localStorage.removeItem('cartcount');
				$('.counter-cardtick').text('0');
				
				var dataMsg = jQuery.parseJSON(data);
				if(dataMsg.error){
					$(".errorMsgShow-2").show();
					$(".errorMsgShow-2").removeClass("success");
					$(".errorMsgShow-2").addClass("error");
					$(".errorMsgShow-2").text(dataMsg.error);							
					setTimeout(function() {
						$('.errorMsgShow-2').hide();
					}, 4000);
				}
				if(dataMsg.success){
					$(".errorMsgShow-2").show();
					$(".errorMsgShow-2").removeClass("error");
					$(".errorMsgShow-2").addClass("success");
					$(".errorMsgShow-2").text(dataMsg.success);
					setTimeout(function() {
						$('.errorMsgShow-2').hide();
						$('#share-email').val('');
						$('#shareCarddetails2').popup('close');
						$.mobile.changePage("#dashboard",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
					}, 4000);	
					 
				}
			}
		);
	}


	function viewProfile(){
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$.post(
				"http://192.168.1.5/nd2no/admin/web-user-info",
				{
				  id: user_id,
				},
				function(profiledetails,status){
					$('.Allprofileview').empty();
					var profileArr = jQuery.parseJSON(profiledetails);
					if(!profileArr.error) {
						$.each( profileArr, function(i, row) {
							
							var firstName   = (row.first_name && row.first_name!='')?row.first_name:'';
							var middleName  = (row.middle_name && row.middle_name!='')?row.middle_name:'';
							var lastName    = (row.last_name && row.last_name!='')?row.last_name:'';
							
							var nameUser    =  firstName+' '+middleName+' '+lastName;
							var genderUser  = (row.gender==1)?'Male':'Female';
							var street_1    = (row.street_1 && row.street_1!='')?row.street_1+' ':''; 
							var street_2    = (row.street_2 && row.street_2!='')?row.street_2+', ':'';
							var state       = (row.state && row.state!='')?row.state+', ':'';
							var city        = (row.city && row.city!='')?row.city+', ':'';
							var zip         = (row.zip && row.zip!='')?row.zip+' ':'';
							var country     = (row.name && row.name!='')?row.name+' ':'';
							var addressUser = street_1+street_2+city+state+country+zip;
							
							/*----------- user image check --------*/
							var photoUser = (row.photo)?row.photo:'';
							if(photoUser){
								var photoUser = 'http://192.168.1.5/nd2no/upload/users/profile-photo/resized/'+photoUser+'';
								var image = new Image(); 
								image.src = photoUser;
								if(image.height == 0) {
									var photoUser = 'http://192.168.1.5/nd2no/img/no-profile.png';
								}
							} else {
								var photoUser = 'http://192.168.1.5/nd2no/img/no-profile.png';
							}
							var dob         = (row.dob)?row.dob:'';
							var about_you   = (row.about_you)?row.about_you:'';
							var mobile      = (row.mobile)?row.mobile:'';
							
							$('.ProfileUpdate').append('<div class="Allprofileview"><div class="main-img"><img src="'+photoUser+'" width="100%" alt=""></div><div class="card-header"><div class="pull-right"><button onClick="changeProfile('+row.id+')" class="ui-btn ui-shadow ui-corner-all"><img src="images/edit-icon.png" width="24" alt=""></button><a title="Change Password" href="#change-password"><button class="ui-btn ui-shadow ui-corner-all" style="margin-top: 1px;"><img width="24" src="images/change-password-icon.png" alt=""></button></a></div><h3 class="title">'+row.uid.toUpperCase()+' – '+nameUser+'</h3><p>'+row.email+'</p><p>'+mobile+'</p></div><div class="page-form"><h3 class="title">Other Details</h3><p><b>Dob: </b>'+dob+'</p><p><b>Gender: </b>'+genderUser+'</p><p><b>Address: </b>'+addressUser+'</p><p><b>About You: </b>'+about_you+'</p></div></div>');
						});
					} else {
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(profileArr.error);
					}
					$.mobile.changePage("#my-profile",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
				}
			)
		} else {
			//$.mobile.changePage("#login");
		}
	}


	function changeProfile(id){
		$.post(
			"http://192.168.1.5/nd2no/admin/web-user-info",
			{
			  id: id,
			},
			function(profiledetails,status){
				$('.Allprofileview').empty();
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) {
					$.each( profileArr, function(i, row) {
					
						var firstName          = (row.first_name && row.first_name!='')?row.first_name:'';
						var middleName       = (row.middle_name && row.middle_name!='')?row.middle_name:'';
						var lastName          = (row.last_name && row.last_name!='')?row.last_name:'';
						
						var nameUser     	= firstName+' '+middleName+' '+lastName;
						var genderMale   	= (row.gender==1)?'selected':'';
						var genderFemale 	= (row.gender==2)?'selected':'';
					
						/*----------- user image check --------*/
						var photoUser = (row.photo)?row.photo:'';
						if(photoUser){
							var photoUser = 'http://192.168.1.5/nd2no/upload/users/profile-photo/resized/'+photoUser+'';
							var image = new Image(); 
							image.src = photoUser;
							if(image.height == 0) {
								var photoUser = 'http://192.168.1.5/nd2no/img/no-profile.png';
							}
						} else {
							var photoUser = 'http://192.168.1.5/nd2no/img/no-profile.png';
						}
						var country_id_val 	= row.country_id;
						var country_name_val= row.name;
						var dob = (row.dob && row.dob!='')?row.dob:'';
						var street_1 = (row.street_1 && row.street_1!='')?row.street_1:'';
						var street_2 = (row.street_2 && row.street_2!='')?row.street_2:'';
						var city = (row.city && row.city!='')?row.city:'';
						var zip = (row.zip && row.zip!='')?row.zip:'';
						var state = (row.state && row.state!='')?row.state:'';
						var phone = (row.phone && row.phone!='')?row.phone:'';
						var mobile = (row.mobile && row.mobile!='')?row.mobile:'';
		 				var countryDropDown = '<select name="country_id" id="country_id" style="max-width:100%;" class="countryUpdate"><option id="countryUpdateSpan" value="">Select Country</option></select>';
						
						$('.EditProfileHtml').append('<div class="Allprofileview"><div class="main-img"><img src="'+photoUser+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+row.uid.toUpperCase()+' – '+nameUser+'</h3><p>'+row.email+'</p></div><form name="editprofile" id="editprofile" enctype="multipart/form-data" method="post"><div class="page-form"><input type="hidden" name="user_id" id="user_id" value="'+row.id+'"><input type="text" name="first_name" placeholder="First Name" id="first_name" value="'+firstName+'"><input type="text" name="middle_name" placeholder="Middle Name" id="middle_name" value="'+middleName+'"><input type="text" name="last_name" placeholder="Last Name" id="last_name" value="'+lastName+'"><input type="text" name="dob" placeholder="DOB" id="dob" value="'+dob+'"><select name="gender" id="gender"><option '+genderMale+' value="1">Male</option><option '+genderFemale+' value="2">Female</option></select><input type="text" name="street1" placeholder="Street" id="street1" value="'+street_1+'"><input type="text" name="street2" placeholder="Landmark" id="street2" value="'+street_2+'"><input type="text" name="city" placeholder="City" id="city" value="'+city+'"><input type="text" name="zip" placeholder="Zip / Postal Code" id="zip" value="'+zip+'"><input type="text" name="state" placeholder="State" id="state" value="'+state+'">'+ countryDropDown +'<input type="text" name="phone" placeholder="Phone" id="phone" value="'+phone+'"><input type="text" name="mobile" placeholder="Mobile" id="mobile" value="'+mobile+'"></div><button onClick="EditProfileSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Edit Profile</button></form></div>');
					 
						$.post(
							"http://192.168.1.5/nd2no/admin/select-countries-data",
							function(countryData,status){									
								$('.Allcountryview').empty();
								var countryArr = jQuery.parseJSON(countryData);									
								$.each( countryArr, function(i, row1) {
									$.each( row1, function(i, row) {
										var selected = (row.id==country_id_val)?'selected':'';
										jQuery('#country_id').append(jQuery("<option "+ selected +"></option>").attr("value", row.id).text(row.name));
									});
								});
								if(country_id_val && country_name_val){
									jQuery('span.countryUpdate').html(country_name_val);
								}
							}
						)
						
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
				}
				$.mobile.changePage("#update-profile",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			}
		)
	}


	function EditProfileSubmit(){

		/*--------- Edit Profile -----------*/  
		$('#editprofile').validate({
			rules: {
				first_name: {
					required: true
				},
				phone: {
					required: true,
					digits: true
				}
			},
			messages: {
				first_name: {
					required: "Please enter your first name."
				},
				phone: {
					required: "Please enter your phone."
				}
			},
			errorPlacement: function (error, element) {
				error.appendTo(element.parent().add());
			},
			submitHandler:function (form) {
				//var formData = new FormData($(this)[0]);
				//var formData = new FormData( this );

				$.post(
					"http://192.168.1.5/nd2no/admin/web-update-profile",
					$("#editprofile").serialize(),
					function(registerData,status){
						var dataMsg = jQuery.parseJSON(registerData);	
						if(dataMsg.error){
							$(".errorMsgShow").show();
							$(".errorMsgShow").removeClass("success");
							$(".errorMsgShow").addClass("error");
							$(".errorMsgShow").text(dataMsg.error);								
							setTimeout(function() {
								$('.errorMsgShow').hide();
							}, 4000);
						}
						if(dataMsg.success){
							$(".errorMsgShow").show();
							$(".errorMsgShow").removeClass("error");
							$(".errorMsgShow").addClass("success");
							$(".errorMsgShow").text(dataMsg.success);
							viewProfile();
							//$.mobile.changePage("#dashboard");
						}
					}
				)
			}
		});
	}


		
		
	/*----------- Logout -----------*/
	function logout(){ 
		window.localStorage.clear();
		$.mobile.changePage("#login"),{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"};
	}
		

	/*--------- Favorite List-----------*/
	function favoritelist(){
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$.mobile.changePage("#favorite-list",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			$('.favoritelistloader').show();
			$.post(
				"http://192.168.1.5/nd2no/admin/web-show-favourites",
				{
				  user_id: user_id,
				},
				function(cardlist,status){
					$('.favoritelistHtml').empty();
					var cardlistArr = jQuery.parseJSON(cardlist);
					if(!cardlistArr.error) {
						$.each( cardlistArr, function(i, row1) {
							$.each( row1, function(i, row) {
								tickiconImg = 'images/tick-icon-black.png'
								alredyexist = false;
								if(localStorage.cartitem){
									var strVale = localStorage.cartitem;
									arrCheak = strVale.split(',');
									for(i=0; i < arrCheak.length; i++){
										if(arrCheak[i]==row.id){
											alredyexist = true;
										}
									}
								}
								if(alredyexist){
									tickiconImg = 'images/tick-icon-black1.png';
								}	

								/*----------- card image check --------*/
								var cardImages = (row.banner)?row.banner:'';
								if(cardImages){
									var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
									var image = new Image(); 
									image.src = cardImages;
									if(image.height == 0) {
										var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
									}
								} else {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
								
								$('.favoritelistHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img  onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="'+tickiconImg+'" alt=""></a> <a href="javascript:void(0);" onClick="removeFavorite('+row.card_favourite_id+');" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						$('.favoritelistloader').hide();
					} else {
						$('.favoritelistloader').hide();
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
					}
				}
			) 
		} else {
			//$.mobile.changePage("#login");
		}
	}



	/*---------- Delete favorite-list  ----------*/
	function removeFavorite(card_favourite_id) { 
		$.post(
			"http://192.168.1.5/nd2no/admin/web-remove-favourite-card",
			{
				favourite_id: card_favourite_id,
			},
			function(result, status){
				var resultArr = jQuery.parseJSON(result);
				if(resultArr.success){
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("error");
					$(".errorMsgShow").addClass("success");
					$(".errorMsgShow").text(resultArr.success); 
					favoritelist()
				}else {						
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(resultArr.error);						
				}
			}
		) 
	}


	/*--------- Card List-----------*/
	function cardlist() {
		$('.cardslistemptyHtml').empty();
		$('.card-list-new').remove();	  
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$('.cardlistloader').show();
			$.post(
				"http://192.168.1.5/nd2no/admin/web-user-cards",
				{
				  user_id: user_id,
				},
				function(cardlist,status){
					$('.swipecardslistHtml').empty();
					var cardlistArr = jQuery.parseJSON(cardlist);
					if(!cardlistArr.error) {
						$.each( cardlistArr, function(i, row1) {
							$.each( row1, function(i, row) {
								var htmlidclass = ''
								if(i==0){
									var htmlidclass = 'id="card-list" data-url="card-list"';
								}
								/*----------- card image check --------*/
								var cardImages = (row.banner)?row.banner:'';
								if(cardImages){
									var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
									var image = new Image(); 
									image.src = cardImages;
									if(image.height == 0) {
										var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
									}
								} else {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
								$('#card-scroller').after('<div data-role="page" class="jqm-demos jqm-page jqm-list card-list-new" '+htmlidclass+'><div data-role="header" class="jqm-header"><div class="left-icon"><a href="#dashboard" class="back-button"><img src="images/back-icon.png" alt=""></a><a href="" class="bell-button"><img src="images/bell-icon.png" alt=""> <span class="counter counter-notify counter-notify-2">0</span></a></div><div class="right-icon"><a href="" class="tick-button"><img src="images/tick-icon.png" alt=""> <span class="counter counter-cardtick">0</span></a><a href="" class="jqm-navmenu-link menu-button ui-link"><img src="images/menu-icon.png" alt=""></a></div><h1 class="title">My Cards</h1></div><div role="main" class="ui-content jqm-content"><div class="dashboard-link" style="border-bottom:0px;"><a class="ui-link" href="javascript:void(0);" onclick="cardlist()"><span class="img"><img class="responsimg" src="images/dashboard.png" alt=""></span></a><a class="ui-link" href="javascript:void(0);" onclick="viewProfile()"><span class="img"><img class="responsimg" src="images/profile-icon.png" alt=""></span></a><a class="ui-link" href="javascript:void(0);" onclick="myFolderShare()"><span class="img"><img class="responsimg" src="images/share.png" alt=""></span></a><a class="ui-link" href="javascript:void(0);" onclick="myfolderList()"><span class="img"><img class="responsimg" src="images/my-folder.png" alt=""></span></a></div><div class="card-listnew"><div class="card-box"><div class="img"><img width="100%" alt="" src="'+cardImages+'"></div></div></div><div class="card-listnew2"><div data-role="controlgroup" data-type="vertical"><div class="bgbuttonnew"><a href="javascript:void(0);" onclick="window.plugins.socialsharing.share(\''+row.title+'\', null, \''+cardImages+'\', \''+cardImages+'\')" data-role="button" class="icon-share" data-icon="share">Share</a></div><div class="bgbuttonnew"><a href="javascript:void(0);" data-role="button" onClick="cartDetails('+row.id+')" class="icon-view" data-icon="view">View</a></div><div class="bgbuttonnew" onClick="showEditcard()"><a href="javascript:void(0);" data-role="button" class="icon-newedit" data-icon="newedit">Edit</a></div><a href="javascript:void(0);" onclick="editscroller('+row.id+')" class="ui-btn editshow-icon" style="display:none;">Text Scroll</a><a href="javascript:void(0);" onclick="cardLink('+row.id+')" class="ui-btn editshow-icon" style="display:none;">Links</a></div></div></div><div data-role="footer" data-position="fixed" data-tap-toggle="false" class="jqm-footer"><div class="rewards-line"><a href="">Refer a Business</a></div></div><div data-role="panel" class="main-menu jqm-navmenu-panel" data-position="right" data-display="overlay"><ul class="jqm-list ui-alt-icon ui-nodisc-icon"><li><a href="#dashboard">Dashboard</a></li><li><a href="javascript:void(0);" onClick="viewProfile()" data-ajax="false">My Profile</a></li><li><a href="javascript:void(0);" onclick="cardlist()" data-ajax="false">My Cards</a></li><li><a href="javascript:void(0);" onclick="favoritelist()" data-ajax="false">Favorite Cards</a></li><li><a href="#change-password" data-ajax="false">Change Password</a></li><li><a href="javascript:void(0);" onClick="logout();" data-ajax="false">Logout</a></li></ul></div></div>');
							});
						});
						$.mobile.changePage("#card-list",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
						$('.cardlistloader').hide();
					} else {
						$('.cardlistloader').hide();	
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						$('.cardslistemptyHtml').append('<p> Please <a href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy\', \'_system\');" class="tick-button ui-link">Click here</a> to create your new card (Regular user) or <a href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy-ae\', \'_system\');" class="tick-button ui-link">Click here</a> (Account Executive).</p>');
						$.mobile.changePage("#card-list-empty",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
					}
				}
			)
		} 
	} 
	
	
	/*--------- Basic Card List-----------*/
	function cardbasiclist() {
		$('.basiccardslistHtml').empty();	  
		$('.foldercardlist').empty();
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$('.basiccardlistloader').show();
			$.mobile.changePage("#basic-card-list",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			$.post(
				"http://192.168.1.5/nd2no/admin/web-user-cards",
				{
				  user_id: user_id,
				},
				function(cardlist,status){
					var cardlistArr = jQuery.parseJSON(cardlist);
					if(!cardlistArr.error) {
						$.each( cardlistArr, function(i, row1) {
							$.each( row1, function(i, row) {
								/*----------- card image check --------*/
								var cardImages = (row.banner)?row.banner:'';
								if(cardImages){
									var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
									var image = new Image(); 
									image.src = cardImages;
									if(image.height == 0) {
										var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
									}
								} else {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
								
								tickiconImg = 'images/tick-icon-black.png'
								alredyexist = false;
								if(localStorage.cartitem){
									var strVale = localStorage.cartitem;
									arrCheak = strVale.split(',');
									for(i=0; i < arrCheak.length; i++){
										if(arrCheak[i]==row.id){
											alredyexist = true;
										}
									}
								}
								if(alredyexist){
									tickiconImg = 'images/tick-icon-black1.png';
								}
								$('.basiccardslistHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a class="tick-button ui-link" id="cd_'+row.id+'" onclick="addCart('+row.id+');" href="javascript:void(0);"><img alt="" src="'+tickiconImg+'" class="cardclass_'+row.id+'"></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="editCard('+row.id+');" src="images/edit-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						 $('.basiccardlistloader').hide();
					} else {
						$('.basiccardlistloader').hide();	
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						   $('.basiccardslistHtml').append('<p> Please <a href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy\', \'_system\');" class="tick-button ui-link">Click here</a> to create your new card (Regular user) or <a href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy-ae\', \'_system\');" class="tick-button ui-link">Click here</a> (Account Executive).</p>');
						
					}
				}
			)
		} else {
			//$.mobile.changePage("#login");
		}
	} 
	
		

	/*--------- Move Card-----------*/
	function moveTocard(){
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){	
			$('#movetofolder').popup('open');
			$.post(
				"http://192.168.1.5/nd2no/admin/web-folder-list",
				{
				  user_id: user_id,
				},
				function(folderlist,status){
					$('.movetoHtml').empty();
					var folderArr = jQuery.parseJSON(folderlist);
					if(!folderArr.error) {
						$.each( folderArr, function(i, row1) {
							$.each( row1, function(i, row) {
								$('.movetoHtml').append('<div><label><input id="folder_name_to" type="radio" checked="" value="'+row.id+'" name="folder_name_to">&nbsp;'+row.folder_name+'</label></div>');
							});
						});
					} else {						
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(folderArr.error);						
					}
				}
			)
		} else {
			//$.mobile.changePage("#login");
		}
	}
		
		
		
		
	function moveTofoldersave(){
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			folder_name = $('input[name=folder_name_to]:radio:checked').val();
			card_id = localStorage.cartitem;
			
			$.post(
				"http://192.168.1.5/nd2no/admin/web-folder-moveto",
				{
				  user_id: user_id,
				  folder_id: folder_name,
				  card_id: card_id,
				},
				function(data,status){
					localStorage.removeItem('cartitem');
					localStorage.removeItem('cartcount');
					$('.counter-cardtick').text('0');
					var dataMsg = jQuery.parseJSON(data);
					if(dataMsg.error){
						$(".errorMsgShow-2").show();
						$(".errorMsgShow-2").removeClass("success");
						$(".errorMsgShow-2").addClass("error");
						$(".errorMsgShow-2").text(dataMsg.error);							
						setTimeout(function() {
							$('.errorMsgShow-2').hide();
						}, 4000);
					}
					if(dataMsg.success){
						
						$(".errorMsgShow-2").show();
						$(".errorMsgShow-2").removeClass("error");
						$(".errorMsgShow-2").addClass("success");
						$(".errorMsgShow-2").text(dataMsg.success);
						setTimeout(function() {
							$('.errorMsgShow-2').hide();
							$('#share-email').val('');
							$('#movetofolder').popup('close');
							$.mobile.changePage("#dashboard",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
						}, 4000);	
						 
					}
				}
			);
		} else {
			//$.mobile.changePage("#login");
		}
	}


	function myFolderShare(){
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$.mobile.changePage("#my-folder-share",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			if(localStorage.getItem('email')) {
				$.post(
					"http://192.168.1.5/nd2no/admin/web-show-folders",
					{
					  user_id: user_id
					},
					function(folderlist,status){
						$('.folder_list').empty();
						var folderlistArr = jQuery.parseJSON(folderlist);	
						
						if (folderlistArr.success){															
							$.each( folderlistArr, function(i, row1) {
								$.each( row1, function(i, row) {
									$('.folder_list').append('<li><a href="javascript:void(0);" onClick="showFoldercards('+row.id+',\''+row.folder_name+'\');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
								});
							});
						}
					}
				);
			}
		} else {
			//$.mobile.changePage("#login");
		}
	}
	
	
	
	
	/*--------- Shared Card List-----------*/
	function myfolderList(){ 
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$.mobile.changePage("#my-folderlist",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			$('.myfolderloader').show();
			if(localStorage.getItem('email')) {
				$.post(
					"http://192.168.1.5/nd2no/admin/web-show-folders",
					{
					  user_id: user_id
					},
					function(folderlist,status){
						$('.folder_listadd').empty();
						var folderlistArr = jQuery.parseJSON(folderlist);
						if(folderlistArr.success){															
							$.each( folderlistArr, function(i, row1) {
								$.each( row1, function(i, row) {
									$('.folder_listadd').append('<li><a href="javascript:void(0);" onClick="showFoldercards('+row.id+',\''+row.folder_name+'\');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
								});
							});
							$('.myfolderloader').hide();
						} else {
							$('.myfolderloader').hide();
						}
					}
				);
			}
		} 
	}
	
	
	
	/*--------- Shared Card List-----------*/
	function sharedMycardlist(){ 

		$('.cardslistHtml').empty();	  
		$('.foldercardlist').empty();
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$('.cardlistloader').show();
			$.mobile.changePage("#share-my-card",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			$.post(
				"http://192.168.1.5/nd2no/admin/web-user-cards",
				{
				  user_id: user_id,
				},
				function(cardlist,status){
					var cardlistArr = jQuery.parseJSON(cardlist);
					if(!cardlistArr.error) {
						$.each( cardlistArr, function(i, row1) {
							$.each( row1, function(i, row) {
								
								tickiconImg = 'images/tick-icon-black.png';
								alredyexist = false;
								if(localStorage.cartitem){
									var strVale = localStorage.cartitem;
									arrCheak = strVale.split(',');
									for(i=0; i < arrCheak.length; i++){
										if(arrCheak[i]==row.id){
											alredyexist = true;
										}
									}
								}
								if(alredyexist){
									tickiconImg = 'images/tick-icon-black1.png';
								}

								/*----------- card image check --------*/
								var cardImages = (row.banner)?row.banner:'';
								if(cardImages){
									var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
									var image = new Image(); 
									image.src = cardImages;
									if(image.height == 0) {
										var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
									}
								} else {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
								
								$('.cardslistHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="'+tickiconImg+'" alt=""></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="editCard('+row.id+');" src="images/edit-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						 $('.cardlistloader').hide();
					} else {
						
						$('.cardlistloader').hide();	
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						$('.cardslistHtml').append('<p> Please <a href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy\', \'_system\');" class="tick-button ui-link">Click here</a> to create your new card (Regular user) or <a href="javascript:void(0);" onclick="window.open(\'http://192.168.1.5/nd2no/ordermy-ae\', \'_system\');" class="tick-button ui-link">Click here</a> (Account Executive).</p>');
					}
				}
			)
		} else {
			//$.mobile.changePage("#login");
		}
	}


	/*--------- Shared Card List-----------*/
	function cardLink(cardId){ 
	
		$.post(
			"http://192.168.1.5/nd2no/admin/web-link-card",{
				card_id: cardId,
			},
			function(profiledetails, status){
				$('.Allprofileview').empty();
				
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) { 
					
					$.each( profileArr, function(i, row) {
						
						var title   		= row.card.title;
						/*----------- card image check --------*/
						var cardImages = row.card.card_large_image_path+row.card.banner;
						if(cardImages){
							var cardImages = cardImages;
							var image = new Image(); 
							image.src = cardImages;
							if(image.height == 0) {
								var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
							}
						} else {
							var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
						}
						
						var banner_html	= ''; 
						var editcard='<div class="Allprofileview"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+title+'</h3></div><form name="card_edit_link" id="card_edit_link" enctype="multipart/form-data" method="post"><div class="page-form addnewlink"><input type="hidden" name="add_cardval" id="add_cardval" value="0"><input type="hidden" name="card_id" id="card_id" value="'+cardId+'">'+ banner_html +'';
						var obj=[];
						 
						$.each( row.links, function(i, row2) {
								
							var icon_id_val   	= row2.iconsid;
							var icon_name_val 	= row2.type;	
							var icon_title_link = (row2.title)?row2.title:'';
							var iconDropDown = '<select name="links['+i+'][type]" class="iconUpdate_'+row2.id+' icon_id_list_'+row2.id+'" id="icon_id_'+row2.id+'" style="max-width:100%;"><option id="iconUpdateSpan" value="">Select Icon</option></select>';
							
							editcard +='<div class="ui-input-text ui-body-inherit link removelink_'+row2.id+'"><a class="tick-button ui-link count-iconlist" onclick="deleteCardLink('+row2.id+');" href="javascript:void(0);" style="margin-left: 47%;"><img src="images/delete.png" alt=""></a>'+iconDropDown+'<input type="text" value="'+row2.url+'" id="'+row2.id+'" placeholder="Link" name="links['+i+'][value]"><input type="text" value="'+icon_title_link+'" id="'+row2.id+'" placeholder="Title" name="links['+i+'][title]"></div>';
						
							$.post(
								"http://192.168.1.5/nd2no/admin/select-icon-data",
								function(iconData,status){									
									var iconArr = jQuery.parseJSON(iconData);									
									$.each( iconArr, function(i, row5) {
										$.each( row5, function(i, row6) {
											var selected = (row2.iconsid==row6.id)?'selected':'';
											jQuery('.icon_id_list_'+row2.id).append(jQuery("<option "+ selected +"></option>").attr("value", row6.id).text(row6.icon_title));
										});
									});
									if(icon_id_val && icon_name_val){
										jQuery('span.iconUpdate_'+row2.id).html(icon_name_val);
									}
								}
							);
						
						});
							editcard +='</div><a style="float: right; margin: 7px;" onclick="addCardLink();" href="javascript:void(0);">Add New</a><button type="button" onClick="cardLinkSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Edit Card Link</button></form></div>';
						$('.updateCardLink').append(editcard);
					
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
				}
				$.mobile.changePage("#card-link",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			}
		)
	}
	
	
	
	function addCardLink(){
		
		add_cardval = $('#add_cardval').val();
		if(add_cardval==0){
			var add_cardval = $('.count-iconlist').length;
			add_cardval++;
			$('#add_cardval').val(add_cardval);	
			add_cardval = $('#add_cardval').val();	
		} else {
			add_cardval = $('#add_cardval').val();
			add_cardval++;			
			$('#add_cardval').val(add_cardval);	
		}
 		editcard = '';
		
		var iconDropDown = '<div class="ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow"><select name="links['+add_cardval+'][type]" class="iconUpdate_'+add_cardval+' icon_id_list_'+add_cardval+'" id="icon_id_'+add_cardval+'" style="max-width:100%;"><option id="iconUpdateSpan" value="">Select Icon</option></select></div>';
		editcard +='<div class="ui-input-text ui-body-inherit link removelink_'+add_cardval+'"><a class="tick-button ui-link" onclick="deleteCardLink('+add_cardval+');" href="javascript:void(0);" style="margin-left: 47%;"><img src="images/delete.png" alt=""></a>'+iconDropDown+'<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="text" value="" id="" placeholder="Link" name="links['+add_cardval+'][value]"></div><div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="text" value="" id="" placeholder="Title" name="links['+add_cardval+'][title]"></div></div>';
	
		$.post(
			"http://192.168.1.5/nd2no/admin/select-icon-data",
			function(iconData,status){									
				var iconArr = jQuery.parseJSON(iconData);									
				$.each( iconArr, function(i, row5) {
					$.each( row5, function(i, row6) {
						jQuery('.icon_id_list_'+add_cardval).append(jQuery("<option></option>").attr("value", row6.id).text(row6.icon_title));
					});
				});
				jQuery('span.iconUpdate_'+add_cardval).html('0');
			}
		)
		editcard +='</div>';
		$('.addnewlink').append(editcard);
 
	}	
	
	
	function cardLinkSubmit(){
		card_id = $('#card_id').val();
		$.post(
			"http://192.168.1.5/nd2no/admin/web-update-link",
			$("#card_edit_link").serialize(),
			function(linkData,status){
				var dataMsg = jQuery.parseJSON(linkData);	
				if(dataMsg.error){
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(dataMsg.error);								
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
				}
				if(dataMsg.success){
					//editCard(card_id);
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("error");
					$(".errorMsgShow").addClass("success");
					$(".errorMsgShow").text(dataMsg.success);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
					//$.mobile.changePage("#dashboard");
				}
			}
		)
	}	
	
	
	/*--------- Shared Card List-----------*/
	function editscroller(cardId){ 
	
		$.post(
			"http://192.168.1.5/nd2no/admin/web-scroller-card",{
				card_id: cardId,
			},
			function(profiledetails, status){
				$('.Allprofileview').empty();
				
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) { 
					
					$.each( profileArr, function(i, row) {
						
						var title   = row.card.title;
						/*----------- card image check --------*/
						var cardImages = row.card.card_large_image_path+row.card.banner;
						if(cardImages){
							var cardImages = cardImages;
							var image = new Image(); 
							image.src = cardImages;
							if(image.height == 0) {
								var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
							}
						} else {
							var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
						}
						
						var banner_html	= ''; 
						var editcard='<div class="Allprofileview"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+title+'</h3></div><form name="card_edit_scroller" id="card_edit_scroller" enctype="multipart/form-data" method="post"><div class="page-form addnewscroller"><input type="hidden" name="add_cardval_scroller" id="add_cardval_scroller" value="0"><input type="hidden" name="card_id" id="card_id" value="'+cardId+'">'+banner_html +' <label>Check to ACTIVATE Scroller on this card <input type="checkbox" name="status" id="status"></label> ';
					
						var obj=[];
						$.each( row.scrollers, function(i, row2) {
							var scroller_title_link = (row2.title)?row2.title:'';							
							var scroller_title_url  = (row2.url)?row2.url:'';
							editcard +='<div class="ui-input-text ui-body-inherit link removescroller_'+i+'"><a class="tick-button ui-link count-iconlist-scroll" onclick="deleteCardScroller('+i+');" href="javascript:void(0);" style="margin-left: 47%;"><img src="images/delete.png" alt=""></a><input type="text" value="'+scroller_title_link+'" id="'+i+'" placeholder="Link" name="scrollers['+i+'][title]"><input type="text" value="'+scroller_title_url+'" id="'+i+'" placeholder="Url" name="scrollers['+i+'][url]"></div>';
						});
						
						editcard +='</div><a style="float: right; margin: 7px;" onclick="addCardScroller();" href="javascript:void(0);">Add New</a><button type="button" onClick="cardScrollerSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Edit Card Scroller</button></form></div>';
						$('.updateCardScroller').append(editcard);
					
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
				}
				$.mobile.changePage("#card-scroller",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			}
		)
	}
	
	
	
	function addCardScroller(){
		
		add_cardval = $('#add_cardval_scroller').val();
		if(add_cardval==0){
			var add_cardval = $('.count-iconlist-scroll').length;
			add_cardval++;
			$('#add_cardval_scroller').val(add_cardval);	
			add_cardval = $('#add_cardval_scroller').val();	
		} else {
			add_cardval = $('#add_cardval_scroller').val();
			add_cardval++;			
			$('#add_cardval_scroller').val(add_cardval);	
		}
 		editcard ='<div class="ui-input-text ui-body-inherit link removescroller_'+add_cardval+'"><a class="tick-button ui-link" onclick="deleteCardScroller('+add_cardval+');" href="javascript:void(0);" style="margin-left: 47%;"><img src="images/delete.png" alt=""></a><div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="text" value="" id="" placeholder="Title" name="scrollers['+add_cardval+'][title]"></div><div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="text" value="" id="" placeholder="URL" name="scrollers['+add_cardval+'][url]"></div></div>';
	
		$('.addnewscroller').append(editcard);
 
	}
	
	
	function cardScrollerSubmit(){
		card_id = $('#card_id').val();
		$.post(
			"http://192.168.1.5/nd2no/admin/web-update-scroller",
			$("#card_edit_scroller").serialize(),
			function(linkData,status){
				var dataMsg = jQuery.parseJSON(linkData);	
				if(dataMsg.error){
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(dataMsg.error);								
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
				}
				if(dataMsg.success){
					//editCard(card_id);
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("error");
					$(".errorMsgShow").addClass("success");
					$(".errorMsgShow").text(dataMsg.success);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
					//$.mobile.changePage("#dashboard");
				}
			}
		)
	}
	
	
	function onBackKeyDown() {
		history.go(-1);
		
	}
	
 	
	function deleteCardLink(cardlinkId){
		$('.removelink_'+cardlinkId).remove();
	}
	
	function deleteCardScroller(cardlinkId){
		$('.removescroller_'+cardlinkId).remove();
	}

	function showEditcard(){
		$(".editshow-icon").toggle();
	}
	
	
	

	$(document).ready(function(){
		
		$('div.ui-page').live("swiperight", function () {
			nextpage = $.mobile.activePage.next('.card-list-new');
			if(nextpage.length != 0) {
 				$.mobile.changePage(nextpage, {
					transition: "slide",
					reverse: false
				});
			}
		});
		
		$('div.ui-page').live("swipeleft", function () {
			prevpage = $.mobile.activePage.prev('.card-list-new');
			if (prevpage.length != 0) {
				$.mobile.changePage(prevpage, {
					transition: "slide",
					reverse: true
				});
			}
		}); 
		
			
		
 
		/*--------- Register -----------*/  
		$('#register_form').validate({
			rules: {
				email: {
					required: true,
					email: true
				},
				phone: {
					required: true,
					digits: true
				},
				password: {
					required: true, minlength: 6
				},
				terms_conditions: {
					required: true
				},
			},
			messages: {
 				email: {
					required: "Please enter your email."
				},
				phone: {
					required: "Please enter your phone."
				},
				password: {
					required: "Please enter your password."
				},
				terms_conditions: {
					required: "Please agree terms & conditions."
				}
			},
			errorPlacement: function (error, element) {
				error.appendTo(element.parent().add());
			},
			submitHandler:function (form) {				
				$.post(
					"http://192.168.1.5/nd2no/admin/web-register",
					$("#register_form").serialize(),
					function(registerData,status){
						var dataMsg = jQuery.parseJSON(registerData);	
						if(dataMsg.error){
							$(".errorMsgShow").show();
							$(".errorMsgShow").removeClass("success");
							$(".errorMsgShow").addClass("error");
							$(".errorMsgShow").text(dataMsg.error);								
							setTimeout(function() {
								$('.errorMsgShow').hide();
							}, 4000);								
						}
						if(dataMsg.success){
							$("#register_form").trigger('reset');
							$(".errorMsgShow-2").show();
							$(".errorMsgShow-2").removeClass("error");
							$(".errorMsgShow-2").addClass("success");
							$(".errorMsgShow-2").text(dataMsg.success);
							window.localStorage.clear();
							$.mobile.changePage("#login",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
						}
					}
				)
			}
		});
		
		
		
		/*--------- Page Before Show -----------*/
		$(document).on('pagebeforeshow', '#login', function(){ 
		
			user_id = localStorage.getItem('userid');
			if(user_id==null || user_id==''){
				user_id = localStorage.getItem('userid-2');
			}
			if(user_id){
			
				if(localStorage.getItem('email')) {
					$.post(
						"http://192.168.1.5/nd2no/admin/web-show-folders",
						{
						  user_id: user_id
						},
						function(folderlist,status){
							$('#folder_list').empty();
							var folderlistArr = jQuery.parseJSON(folderlist);	
							
							if (folderlistArr.success){
																
								$.each( folderlistArr, function(i, row1) {
									$.each( row1, function(i, row) {
										$('#folder_list').append('<li><a href="javascript:void(0);" onClick="showFoldercards('+row.id+',\''+row.folder_name+'\');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
									});
								});
							}
						}
					);
					$.mobile.changePage("#dashboard",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
				}
			} else {
				//$.mobile.changePage("#login");
			}
		});

		
		
		/*--------- Page Before Show -----------*/
		/*$(document).on('pagebeforeshow', '#dashboard', function(){ 
			user_id = localStorage.getItem('userid');
			if(user_id==null || user_id==''){
				user_id = localStorage.getItem('userid-2');
			}
			if(user_id){
				$.post(
					"http://192.168.1.5/nd2no/admin/web-show-folders",
					{
					  user_id: user_id
					},
					function(folderlist,status){
						$('.allfoldert').empty();
						var folderlistArr = jQuery.parseJSON(folderlist);	
							
							if (folderlistArr.success){
																
								$.each( folderlistArr, function(i, row1) {
									$.each( row1, function(i, row) {
										$('#folder_list').append('<li class="allfoldert"><a href="javascript:void(0);" onClick="showFoldercards('+row.id+',\''+row.folder_name+'\');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
									});
								});
							}
					}
				);			
				$.mobile.changePage("#dashboard"),{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"};
			 } else {
				//$.mobile.changePage("#login");
			}
		}); */	


		/*--------- Folder Save-----------*/
		$("#folder_save").click(function(){	
		
			user_id = localStorage.getItem('userid');
			if(user_id==null || user_id==''){
				user_id = localStorage.getItem('userid-2');
			}
			if(user_id){
		
				$.post(
					"http://192.168.1.5/nd2no/admin/web-create-folder",
					{
					  user_id: user_id,
					  folder_name: $("#folder_name").val()
					},
					function(data,status){
					
						var dataMsg = jQuery.parseJSON(data);
						
						if(dataMsg.error){
							$(".errorMsgShow").show();
							$(".errorMsgShow").removeClass("success");
							$(".errorMsgShow").addClass("error");
							$(".errorMsgShow").text(dataMsg.error);							
							setTimeout(function() {
								$('.errorMsgShow').hide();
							}, 4000);
						}
						if(dataMsg.success){
							$(".errorMsgShow").show();
							$(".errorMsgShow").removeClass("error");
							$(".errorMsgShow").addClass("success");
							$(".errorMsgShow").text(dataMsg.success);
							setTimeout(function() {
								$('.errorMsgShow').hide();
							}, 4000);							
						}
						
						
						$("#folder_name").val('');
						$.post(
							"http://192.168.1.5/nd2no/admin/web-show-folders",
							{
							  user_id: user_id
							},
							function(folderlist,status){							
								$('.folder_listadd').empty();
								var folderlistArr = jQuery.parseJSON(folderlist);	
						
							if (folderlistArr.success){		
								$.each( folderlistArr, function(i, row1) {
									$.each( row1, function(i, row) {
										$('.folder_listadd').append('<li><a href="javascript:void(0);" onClick="showFoldercards('+row.id+',\''+row.folder_name+'\');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
									});
								});
							}
							}
						);
					}
				);
			} else {
				//$.mobile.changePage("#login");
			}
		});
		
		
		
		/*----------- Forgot Password -----------*/
		$("#forgot-email-button").click(function(){
			$.post(
				"http://192.168.1.5/nd2no/admin/web-forget-password",
				{
				  email: $("#forgot-email").val(),
				},
				function(forgotData,status){
					var dataMsg = jQuery.parseJSON(forgotData);
					if(dataMsg.error){
						$(".errorMsgShow").show();
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(dataMsg.error);							
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);
						
					}
					if(dataMsg.success){
						$(".errorMsgShow-2").show();
						$(".errorMsgShow-2").removeClass("error");
						$(".errorMsgShow-2").addClass("success");
						$(".errorMsgShow-2").text(dataMsg.success);
						$("#forgot-email").val('');
						$.mobile.changePage("#login",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
					}
				}
			)
		});
		
		
		/*----------- Notifications Count -----------*/
		$(document).on('pagebeforeshow', function(){
			
			
				$('.errorMsgShow-2').hide();
			
		
			$(".errorMsgShow").hide();		
			if (!localStorage.cartcount){
			var itemcount = 0;
			} else {
			var itemcount =localStorage.cartcount;
			}
			$('.counter-cardtick').text(itemcount);
			
			user_id = localStorage.getItem('userid');
			if(user_id==null || user_id==''){
				user_id = localStorage.getItem('userid-2');
			}
			if(user_id){
				$.post(
					"http://192.168.1.5/nd2no/admin/web-notification-total",
					{
					  user_id: user_id
					},
					function(countcard,status){
						var cardCount = jQuery.parseJSON(countcard);
						$('.counter-notify').text(cardCount.success);
					}
				);
			} else {
				//$.mobile.changePage("#login");
			}
		});

		
		/*----------- Notifications List -----------*/
		$(".counter-notify-2").click(function(){
			
			
			user_id = localStorage.getItem('userid');
			if(user_id==null || user_id==''){
				user_id = localStorage.getItem('userid-2');
			}
			if(user_id){
				$.mobile.changePage("#notification",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
				$('.notificationlistloader').show();
				$.post(
					"http://192.168.1.5/nd2no/admin/web-notification-list",
					{
					  user_id: user_id,
					},
					function(cardlist,status){
						$('.notification-list').empty();
						var cardlistArr = jQuery.parseJSON(cardlist);
						if(!cardlistArr.error) {
							$.each( cardlistArr, function(i, row1) {
								$.each( row1, function(i, row) {

									/*----------- card image check --------*/
									var cardImages = (row.banner)?row.banner:'';
									if(cardImages){
										var cardImages = 'http://192.168.1.5/nd2no/upload/cards/thumb/'+cardImages+'';
										var image = new Image(); 
										image.src = cardImages;
										if(image.height == 0) {
											var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
										}
									} else {
										var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
									}
									
									if (row.is_share_notify==1){
									$('.notification-list').append('<li><div class="img"><img src="'+cardImages+'" alt=""></div><div class="text">'+row.first_name+' '+row.middle_name+' '+row.last_name+' has shared his “<a href="javascript:void(0);" onClick="cartDetailsNotification('+row.id+');">'+row.title+'</a>” Card with you at '+row.updated_at+'</div></li>');
									} else {
									$('.notification-list').append('<li><div class="img"><img src="'+cardImages+'" alt=""></div><div class="text">'+row.first_name+' '+row.middle_name+' '+row.last_name+' has updated his “<a href="javascript:void(0);" onClick="cartDetailsNotification('+row.id+');">'+row.title+'</a>” Card at '+row.updated_at+'</div></li>');
									}
									
								});
							});
							$('.notificationlistloader').hide();
						} else {
							$('.notificationlistloader').hide();
							$(".errorMsgShow").show();
							$(".errorMsgShow").addClass("error");
							$(".errorMsgShow").text(cardlistArr.error);
						}
					}
				)
			} else {
				//$.mobile.changePage("#login");
			}
		});
		
		
			/*---------------Listing for selected cards--------------*/
		
		$(".counter-cardtick").click(function(){
			$.mobile.changePage("#selected-cards",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			$('.cardticklistloader').show();			
			if (!localStorage.cartitem){
				var items = '';
			} else {
				var items =localStorage.cartitem;
			}
		
			$.post(
				"http://192.168.1.5/nd2no/admin/web-selected-cards",
				{
				  selected_card_ids: items
				},
				function(cardlist,status){
					$('.ticked-list').empty();
					var cardlistArr = jQuery.parseJSON(cardlist);
					if(!cardlistArr.error) {
						$.each( cardlistArr, function(i, row1) {
							$.each( row1, function(i, row) {
								/*----------- card image check --------*/
								var cardImages = (row.banner)?row.banner:'';
								if(cardImages){
									var cardImages = 'http://192.168.1.5/nd2no/upload/cards/large/'+cardImages+'';
									var image = new Image(); 
									image.src = cardImages;
									if(image.height == 0) {
										var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
									}
								} else {
									var cardImages = 'http://192.168.1.5/nd2no/img/card_images/no-card-pic.png';
								}
								$('.ticked-list').append('<li><div class="card-option"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="removeSelected('+row.id+');" src="images/delete-icon.png" alt=""></a></div><div class="img"><img src="'+cardImages+'" alt=""></div></li>');
							
							});
						});
						$('.cardticklistloader').hide();
					} else {
						$('.cardticklistloader').hide();
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
					}
				}
			)
		});
		
		
		/*------------- Change Password -------------*/
		$('#changepassword_form').validate({
			rules: {
				current_password: {
					required: true, minlength: 6
				},
				new_password: {
					required: true, minlength: 6
				},
				password_confirmation: {
					required: true, equalTo: "#new_password", minlength: 6
				},
			},
			messages: {
				current_password: {
					required: "Please enter your current password."
				},
				new_password: {
					required: "Please enter your new password."
				},
				password_confirmation: {
					required: "Please enter your confirm password."
				}
			},
			errorPlacement: function (error, element) {
				error.appendTo(element.parent().add());
			},
			submitHandler:function (form) {	

				user_id = localStorage.getItem('userid');
				if(user_id==null || user_id==''){
					user_id = localStorage.getItem('userid-2');
				}
				if(user_id){		
					$.post(
						"http://192.168.1.5/nd2no/admin/web-cahnge-password",
						{
						  current_password: $("#current_password").val(),
						  password: $("#new_password").val(),
						  password_confirmation: $("#password_confirmation").val(),
						  user_id: user_id
						},
						function(passwordData,status){
							var dataMsg = jQuery.parseJSON(passwordData);
							if(dataMsg.error){
								$(".errorMsgShow").show();
								$(".errorMsgShow").removeClass("success");
								$(".errorMsgShow").addClass("error");
								$(".errorMsgShow").text(dataMsg.error);	
							}
							if(dataMsg.success){
								$("#changepassword_form").trigger('reset');
								$(".errorMsgShow-2").show();
								$(".errorMsgShow-2").removeClass("error");
								$(".errorMsgShow-2").addClass("success");
								$(".errorMsgShow-2").text(dataMsg.success);
								$.mobile.changePage("#dashboard",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
							}
						}
					)
				} else {
					//$.mobile.changePage("#login");	
				}
			}
		});
		
		

	});