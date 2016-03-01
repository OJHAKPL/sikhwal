 	$(document).on('pagebeforecreate', '[data-role="page"]', function() {
		loading('show', 1);
	});
	 
	 
	function loading(showOrHide, delay) {
		setTimeout(function() {
			$.mobile.loading(showOrHide);
		}, delay);
	}

	
	function pushNotify() {
		
		  var push = PushNotification.init({
            "ios": {
			 "alert": true,
              "sound": true,
              "vibration": true,
              "badge": true,
              "clearBadge": true
            }
        });

        push.on('registration', function(data) {
            // send data.registrationId to push service
			$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-device-tocken",
			{
				tocken_id: data.registrationId, //'adjadkdjkalskjsaaldkSAJKLD',
				user_id: localStorage.getItem('userid')
			},
			function(data,status){
				var dataArray = jQuery.parseJSON(data);
				var htmlStr='';
				$.each(dataArray, function(i, field){
					
				});					
			});
        }); 
		
		push.on('notification', function(data) {
            // do something with the push data
            // then call finish to let the OS know we are done
			showAlert(data.message)
			//alert(data.message);
			//alert(data.title);
			//alert(data.sound);
			//alert(data.image);
			//alert(data.additionalData);
			// data.title,
			// data.count,
			// data.sound,
			// data.image,
			// data.additionalData
			//alert(data.registrationId+'here');
            push.finish(function() {
				console.log("processing of push data is finished");
            });
        }); 
		
		push.on('error', function(e) {
			showAlert(e.message+ 'error');
			//console.log(e.message);
		});
		
		
	}	 
	
	
	
	function navigationOpen(){ 
		$( ".jqm-navmenu-panel ul" ).listview();
		$.mobile.activePage.find('.menu-new').panel("open") ;
	}
	
	/*--------- Login -----------*/  
	function homeLogin() {
		$.post(
		"https://www.nd2nosmart.cards/nd2no/admin/web-login",
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
					pushNotify();
					cardlist();
				} else {
					if(dataArray.error){
						$(".errorMsgShow").show();
						$(".errorMsgShow").removeClass("success");
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-folder-cards",
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
		 					$('.myfolderDetailsHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="images/tick-icon-black.png" alt=""></a> <a href="javascript:void(0);" onClick="deleteMyfolder('+row.card_shared_id+')" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
						});
					});
					$('.folderviewloder').hide();
				} else {	
					$('.folderviewloder').hide();
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);	
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);	
				}
			}
		) 
	}
	
	
	function deleteMyfolder(card_shared_id){
		
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-folder-delete",
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
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(resultArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);	
				}
			}
		) 
	}


	/*----------- card details from notification----------*/
	function cartDetailsNotification(cardId) {
		
		
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-cards-detail",
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
				
				$(".card-link-details").empty();
				$(".card-icons").empty();
				$(".allsociallink").empty();
				
				$.each( cardDetailsArr, function(i, firstRow) {	
					iconUrl = firstRow.card.icon_url_path;
					uid = firstRow.card.uid;
					userRole = firstRow.card.role_id;
					getACard = firstRow.card.getacard_icon;
					var cardImages = firstRow.card.banner;
					$('.card-link-details').append('<input type="hidden" name="sharecard_id" id="sharecard_id" value="'+cardId+'"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><div class="pull-right"><a href="#shareCarddetails" data-rel="popup"><button class="ui-btn ui-shadow ui-corner-all"><img src="images/share-icon.png" alt=""></button></a></div><h3 class="title">'+firstRow.card.title+'</h3></div>');
				});
		
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						if (row2.type=='Business Email'){
							$('.card-icons').append('<a class="ui-link" href="mailto:'+row2.url+'" data-rel="external" ><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else if (row2.type=='Youtube'){
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_blank\',location=\'yes\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else {
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						}
					});
				});
				
				if (userRole == 3 || userRole == 4) {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				} else {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				}
				
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						linktitle = (row2.title && row2.title!='')?row2.title:row2.type;
						if (row2.type=='Business Email'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="mailto:'+row2.url+'" data-rel="external"><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}else if (row2.type=='Youtube'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_blank\',location=\'yes\');"><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}else {
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');" ><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}
					}); 
				}); 
				
				if (userRole == 3 || userRole == 4) {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				} else {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				}
			
			}
		);
		
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}	
		if(user_id){
			$.post(
				"https://www.nd2nosmart.cards/nd2no/admin/web-reset-notification",
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
	
	
	
	
	
	
	/*----------- card notification details ----------*/
	function cartDetailsNotification(cardId) {
		$('.cardDetails').show();
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-cards-detail",
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
				
				$(".card-link-details").empty();
				$(".card-icons").empty();
				$(".allsociallink").empty();
				
				$.each(cardDetailsArr, function(i, firstRow) {	
					$('.marquee-text').remove();
					$('.mainimgremove').remove();
					marqueeList = '';
					$.each(firstRow.scrollers, function(i, row5) {
						scroll_title = (row5.title)?row5.title:'';
						scroll_url   = (row5.url)?row5.url:'';
						if(scroll_url && scroll_url!=''){
							if(scroll_url.indexOf("youtu") >= 0){
								marqueeList += '<a class="ui-link" style="text-decoration: none;" href="javascript:void(0);" onclick="window.open(\''+scroll_url+'\', \'_blank\',location=\'yes\');">'+scroll_title+'</a>&nbsp;&nbsp;';
							} else {
								marqueeList += '<a class="ui-link" style="text-decoration: none;" href="javascript:void(0);" onclick="window.open(\''+scroll_url+'\', \'_system\');">'+scroll_title+'</a>&nbsp;&nbsp;';
							}
						} else {
							marqueeList += '<a class="ui-link" style="text-decoration: none;" href="javascript:void(0);">'+scroll_title+'</a>&nbsp;&nbsp;';
						}
					});
					if(marqueeList){
						marqueeList = '<div class="marquee-text"><marquee onmouseover="this.setAttribute(\'scrollamount\', 0, 0);" onmouseout="this.setAttribute(\'scrollamount\', 6, 0);" direction="left">'+marqueeList+'</marquee></div>';
					}
					
					iconUrl = firstRow.card.icon_url_path;
					uid = firstRow.card.uid;
					userRole = firstRow.card.role_id;
					getACard = firstRow.card.getacard_icon;
					
					
					shareUrl = "https://www.nd2nosmart.cards/nd2no/card/"+firstRow.card.post_key+"-"+cardId+"/mobile";
					var cardImages = firstRow.card.banner;
					$('.card-link-details').append('<input type="hidden" name="sharecard_id" id="sharecard_id" value="'+cardId+'"><div class="main-img mainimgremove"><img src="'+cardImages+'" width="100%" alt=""></div>'+marqueeList+'<div class="card-header"><div class="pull-right"><a href="javascript:void(0);" onclick="window.plugins.socialsharing.share(\''+firstRow.card.title+'\', null, \''+cardImages+'\', \''+shareUrl+'\')"><button type="button" class="ui-btn ui-shadow ui-corner-all"><img src="images/share-icon.png" alt=""></button></a></div><h3 class="title">'+firstRow.card.title+'</h3></div>');
				});
		
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						if(row2.type=='Business Email'){
							$('.card-icons').append('<a class="ui-link" href="mailto:'+row2.url+'" data-rel="external" ><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else if(row2.type=='Youtube'){
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_blank\',location=\'yes\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else {
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						}
					});
				});
				
				if(userRole == 3 || userRole == 4) {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				} else {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				}
				
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						linktitle = (row2.title && row2.title!='')?row2.title:row2.type;
						if (row2.type=='Business Email'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="mailto:'+row2.url+'" data-rel="external"><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}else if (row2.type=='Youtube'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_blank\',location=\'yes\');" ><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}else {
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');" ><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}
					}); 
				}); 
				
				if (userRole == 3 || userRole == 4) {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				} else {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				}
				$('.cardDetails').hide();
			}
		);
		
		
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}	
		if(user_id){
			$.post(
				"https://www.nd2nosmart.cards/nd2no/admin/web-reset-notification",
				{
					card_id: cardId,
					user_id: user_id
				},
				function(result, status){
					
				}
			); 
			$.mobile.changePage("#card-details",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
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
			$.ajax({
				type: 'POST',
				url: 'https://www.nd2nosmart.cards/nd2no/admin/web-shared-cards',
				beforeSend: function(){
					$('.loader_sharelist').show();
				},
				complete: function(){
					$('.loader_sharelist').hide();
				},
				data: { "user_id": user_id },
				success: function(cardlist){
					
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
								var first_name = (row.first_name)?row.first_name:'';
								var last_name  = (row.last_name)?row.last_name:'';
								var email      = (row.email)?row.email:'';
								var mobile     = (row.mobile)?row.mobile:'';
								 
								$('.cardsshareHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="'+tickiconImg+'" alt=""></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="deleteCard('+row.card_shared_id+');" src="images/delete-icon.png" alt=""></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="createAddnewcontact('+"'"+first_name+"'"+','+"'"+last_name+"'"+','+"'"+email+"'"+','+"'"+mobile+"'"+','+"'"+cardImages+"'"+');" src="images/contact-add.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						$('.sharelistloader').hide();
					} else {
						$('.sharelistloader').hide();
						$(".errorMsgShow").show();
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);	
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);	
					}
					
					
		 
				},
				dataType: 'html'
			});	 
			
			/*$.post(
				"https://www.nd2nosmart.cards/nd2no/admin/web-shared-cards",
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
								/*var cardImages = (row.banner)?row.banner:'';
								var first_name = (row.first_name)?row.first_name:'';
								var last_name  = (row.last_name)?row.last_name:'';
								var email      = (row.email)?row.email:'';
								var mobile     = (row.mobile)?row.mobile:'';
								 
								$('.cardsshareHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="'+tickiconImg+'" alt=""></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="deleteCard('+row.card_shared_id+');" src="images/delete-icon.png" alt=""></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="createAddnewcontact('+"'"+first_name+"'"+','+"'"+last_name+"'"+','+"'"+email+"'"+','+"'"+mobile+"'"+','+"'"+cardImages+"'"+');" src="images/contact-add.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						$('.sharelistloader').hide();
					} else {
						$('.sharelistloader').hide();
						$(".errorMsgShow").show();
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);	
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);	
					}
				}
			) */
		}  
	}	

 
	/*---------- Delete shared card ----------*/
	function deleteCard(card_shared_id) { 
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-remove-shared-card",
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
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(resultArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);	
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-selected-cards",
			{
			  selected_card_ids: items
			},
			function(cardlist,status){
				$('.ticked-list').empty();
				$('.sharecardremove').remove();
				var cardlistArr = jQuery.parseJSON(cardlist);
				if(!cardlistArr.error) {
					cardImages2 = '';
					shareUrl = '';
					card_ids = '';
					$.each( cardlistArr, function(i, row1) {
						$.each( row1.card, function(i, row) {	
							var cardImages = (row.banner_thumb)?row.banner_thumb:'';
							$('.ticked-list').append('<li><div class="card-option"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="removeSelected('+row.id+');" src="images/delete-icon.png" alt=""></a></div><div class="img"><img src="'+cardImages+'" alt=""></div></li>');
							card_ids += row.id+'-';
							cardImages2 += "'"+cardImages+"',";
						});
						
						if(card_ids){
							card_ids = card_ids.substring(0,card_ids.length - 1);
							shareUrl = 'https://www.nd2nosmart.cards/nd2no/mobi-shared/'+card_ids;
						}
						if(cardImages2){
							cardImages2 = cardImages2.substring(0,cardImages2.length - 1);
						}
						$('.sharecardImgdev').after('<a class="sharecardremove ui-btn ui-shadow ui-corner-all" onclick="window.plugins.socialsharing.share(\'Cards To Share\', null,['+cardImages2+'], \''+shareUrl+'\')" href="javascript:void(0);">Share with</a>');
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);	
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-cards-detail",
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
				
				$(".card-link-details").empty();
				$(".card-icons").empty();
				$(".allsociallink").empty();
				
				$.each(cardDetailsArr, function(i, firstRow) {	
					$('.marquee-text').remove();
					$('.mainimgremove').remove();
					marqueeList = '';
					$.each(firstRow.scrollers, function(i, row5) {
						scroll_title = (row5.title)?row5.title:'';
						scroll_url   = (row5.url)?row5.url:'';
						if(scroll_url && scroll_url!=''){
							if(scroll_url.indexOf("youtu") >= 0){
								marqueeList += '<a class="ui-link" style="text-decoration: none;" href="javascript:void(0);" onclick="window.open(\''+scroll_url+'\', \'_blank\',location=\'yes\');">'+scroll_title+'</a>&nbsp;&nbsp;';
							} else {
								marqueeList += '<a class="ui-link" style="text-decoration: none;" href="javascript:void(0);" onclick="window.open(\''+scroll_url+'\', \'_system\');">'+scroll_title+'</a>&nbsp;&nbsp;';
							}
						} else {
							marqueeList += '<a class="ui-link" style="text-decoration: none;" href="javascript:void(0);">'+scroll_title+'</a>&nbsp;&nbsp;';
						}
					});
					if(marqueeList){
						marqueeList = '<div class="marquee-text"><marquee onmouseover="this.setAttribute(\'scrollamount\', 0, 0);" onmouseout="this.setAttribute(\'scrollamount\', 6, 0);" direction="left">'+marqueeList+'</marquee></div>';
					}
					
					iconUrl = firstRow.card.icon_url_path;
					uid = firstRow.card.uid;
					userRole = firstRow.card.role_id;
					getACard = firstRow.card.getacard_icon;
					
					
					shareUrl = "https://www.nd2nosmart.cards/nd2no/card/"+firstRow.card.post_key+"-"+cardId+"/mobile";
					var cardImages = firstRow.card.banner;
					$('.card-link-details').append('<input type="hidden" name="sharecard_id" id="sharecard_id" value="'+cardId+'"><div class="main-img mainimgremove"><img src="'+cardImages+'" width="100%" alt=""></div>'+marqueeList+'<div class="card-header"><div class="pull-right"><a href="javascript:void(0);" onclick="window.plugins.socialsharing.share(\''+firstRow.card.title+'\', null, \''+cardImages+'\', \''+shareUrl+'\')"><button type="button" class="ui-btn ui-shadow ui-corner-all"><img src="images/share-icon.png" alt=""></button></a></div><h3 class="title">'+firstRow.card.title+'</h3></div>');
				});
		
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						if(row2.type=='Business Email'){
							$('.card-icons').append('<a class="ui-link" href="mailto:'+row2.url+'" data-rel="external" ><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else if (row2.type=='Youtube'){
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_blank\',location=\'yes\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						} else {
							$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');"><img src="'+iconUrl+row2.icon_image+'" alt=""></a>');
						}
					});
				});
				
				if(userRole == 3 || userRole == 4) {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				} else {
					$('.card-icons').append('<a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy/'+uid+'\', \'_system\');"><img src="'+iconUrl+getACard+'" alt=""></a>');
				}
				
				$.each( cardDetailsArr, function(i, row1) {
					$.each( row1.links, function(i, row2) {
						linktitle = (row2.title && row2.title!='')?row2.title:row2.type;
						if (row2.type=='Business Email'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="mailto:'+row2.url+'" data-rel="external"><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}else if (row2.type=='Youtube'){
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_blank\',location=\'yes\');" ><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}else {
							$('.card-link-details3').append('<ul class="card-details allsociallink"><li><a style="text-decoration: none; font-weight: normal; color: rgb(55, 55, 55);" class="ui-link" href="javascript:void(0);" onclick="window.open(\''+row2.url+'\', \'_system\');" ><div class="img"><img src="'+iconUrl+row2.icon_image+'" alt=""></div><div class="title">'+linktitle+'</div></a></li></ul>');
						}
					}); 
				}); 
				
				if (userRole == 3 || userRole == 4) {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				} else {
				$('.card-link-details3').append('<ul class="card-details allsociallink"><li><div class="img"><img src="'+iconUrl+getACard+'" alt=""></div><div class="title"><a class="ui-link" href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy/'+uid+'\', \'_system\');" >Get A Card</a></div></li></ul>');
				}
				$('.cardDetails').hide();
			}
		);
		$.mobile.changePage("#card-details",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
	}



	/*----------- card details ----------*/
	function editCard(cardId){
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-update-card/"+cardId+"",
			function(profiledetails, status){
				$('.updateCard').empty();
				
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) {
					$.each( profileArr, function(i, row) {
						var title   		= row.card.title;
						/*----------- card image check --------*/
						var cardImages = row.card.banner;
						
						var title_html	= '<div class="ui-input-text ui-body-inherit"><input type="text" value="'+row.card.title+'" id="title" placeholder="Title" name="title"></div>';
						var banner_html	= ''; 
						var editcard='<div class="editcardremove"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+title+'</h3></div><div style="display: flex; height: 47px;"><a style="width: 50%; text-decoration: none;" title="Links" href="javascript:void(0);" onclick="cardLink('+cardId+')" data-rel="popup"><button type="button" class="ui-btn ui-shadow ui-corner-all">Links</button></a><a style="width: 50%; text-decoration: none;" title="Text Scroll" href="javascript:void(0);" onclick="editscroller('+cardId+')" data-rel="popup"><button type="button" class="ui-btn ui-shadow ui-corner-all">Text Scroll</button></a></div><form name="edit_card" id="edit_card" enctype="multipart/form-data" method="post"><div class="page-form"><input type="hidden" name="card_id" id="card_id" value="'+cardId+'">'+ title_html + banner_html +'';
					
				 		editcard +='</div><button onClick="EditCardSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Save</button></form></div>';
						$('.updateCard').append(editcard);
					
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);	
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
				*/
			
				card_id = jQuery('#edit_card').find('input[name="card_id"]').val();
				$.post(
					"https://www.nd2nosmart.cards/nd2no/admin/web-update-card/"+card_id+"",{
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
							}, 4000);	
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-share-cards",
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-share-cards",
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
						cardlist();
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
				"https://www.nd2nosmart.cards/nd2no/admin/web-user-info",
				{
				  id: user_id,
				},
				function(profiledetails,status){
					$('.viewprofileremove').remove();
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
							
							var photoUser = (row.photo)?row.photo:'';
 							var dob         = (row.dob)?row.dob:'';
							var about_you   = (row.about_you)?row.about_you:'';
							var mobile      = (row.mobile)?row.mobile:'';
							
							$('.ProfileUpdate').append('<div class="viewprofileremove"><div class="main-img"><img src="'+photoUser+'" style="width:100%;" alt=""></div><div class="card-header"><div class="pull-right"><button onClick="changeProfile('+row.id+')" class="ui-btn ui-shadow ui-corner-all"><img src="images/edit-icon.png" width="24" alt=""></button><a title="Change Password" href="#change-password"><button class="ui-btn ui-shadow ui-corner-all" style="margin-top: 1px;"><img width="24" src="images/change-password-icon.png" alt=""></button></a></div><h3 class="title">'+row.uid.toUpperCase()+' – '+nameUser+'</h3><p>'+row.email+'</p><p>'+mobile+'</p></div><div class="page-form"><h3 class="title">Other Details</h3><p><b>Dob: </b>'+dob+'</p><p><b>Gender: </b>'+genderUser+'</p><p><b>Address: </b>'+addressUser+'</p><p><b>About You: </b>'+about_you+'</p></div></div>');
						});
					} else {
						$(".errorMsgShow").show();
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(profileArr.error);
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-user-info",
			{
			  id: id,
			},
			function(profiledetails,status){
				$('.cahngeprofileremove').remove();
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) {
					$.each( profileArr, function(i, row) {
					
						var firstName       = (row.first_name && row.first_name!='')?row.first_name:'';
						var middleName      = (row.middle_name && row.middle_name!='')?row.middle_name:'';
						var lastName        = (row.last_name && row.last_name!='')?row.last_name:'';						
						var nameUser     	= firstName+' '+middleName+' '+lastName;
						var genderMale   	= (row.gender==1)?'selected':'';
						var genderFemale 	= (row.gender==2)?'selected':'';
					
						var photoUser = (row.photo)?row.photo:'';
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
						
						$('.EditProfileHtml').append('<div class="cahngeprofileremove"><div class="main-img"><img id="cameraPic" src="'+photoUser+'" style="width:100%;" alt=""></div><div class="card-header"><h3 class="title">'+row.uid.toUpperCase()+' – '+nameUser+'</h3><p>'+row.email+'</p></div><form name="editprofile" id="editprofile" enctype="multipart/form-data" method="post"><div class="page-form"><small>Change Profile Photo</small><div id="camera" style="height: 60px;"><button class="camera-control ui-btn ui-shadow ui-corner-all" type="button" onclick="capturePhoto();" style="width: 50%; float: left;">Camera</button><button class="camera-control ui-btn ui-shadow ui-corner-all" type="button" onclick="getPhoto();" style="width: 50%; float: right;">Gallery</button></div><input type="hidden" name="user_id" id="user_id" value="'+row.id+'"><input type="text" name="first_name" placeholder="First Name" id="first_name" value="'+firstName+'"><input type="text" name="middle_name" placeholder="Middle Name" id="middle_name" value="'+middleName+'"><input type="text" name="last_name" placeholder="Last Name" id="last_name" value="'+lastName+'"><input data-role="date" data-date-format="yy-mm-dd" type="date" name="dob" placeholder="YYYY-MM-DD" id="dob" value="'+dob+'"><select name="gender" id="gender"><option '+genderMale+' value="1">Male</option><option '+genderFemale+' value="2">Female</option></select><input type="text" name="street1" placeholder="Street" id="street1" value="'+street_1+'"><input type="text" name="street2" placeholder="Landmark" id="street2" value="'+street_2+'"><input type="text" name="city" placeholder="City" id="city" value="'+city+'"><input type="text" name="zip" placeholder="Zip / Postal Code" id="zip" value="'+zip+'"><input type="text" name="state" placeholder="State" id="state" value="'+state+'">'+ countryDropDown +'<input type="text" name="phone" placeholder="Phone" id="phone" value="'+phone+'"><input type="text" name="mobile" placeholder="Mobile" id="mobile" value="'+mobile+'"></div><button type="submit" onClick="EditProfileSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Edit Profile</button></form></div>');
						$(".EditProfileHtml").trigger("create");
					 
						$.post(
							"https://www.nd2nosmart.cards/nd2no/admin/select-countries-data",
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
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);	
				}
				$.mobile.changePage("#update-profile",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
			}
		)
	}
	
	
	var pictureSource;   // picture source
	var destinationType; // sets the format of returned value

	document.addEventListener("deviceready", onDeviceReady, false);

	function onDeviceReady() {
	    pictureSource   = navigator.camera.PictureSourceType;
	    destinationType = navigator.camera.DestinationType;
	}

	function clearCache() {
	    navigator.camera.cleanup();
	} 


	var sPicData; //store image data for image upload functionality

	function capturePhoto(){
	    navigator.camera.getPicture(picOnSuccess, picOnFailure, {
	                                quality: 20,
	                                destinationType: destinationType.FILE_URI,
	                                sourceType: pictureSource.CAMERA,
	                                correctOrientation: true
	                                });
	}

	function getPhoto(){
	    navigator.camera.getPicture(picOnSuccess, picOnFailure, {
	        quality: 20,
	        destinationType: destinationType.FILE_URI,
	        sourceType: pictureSource.SAVEDPHOTOALBUM,
	        correctOrientation: true
	    });
	}

	function picOnSuccess(imageData){

	    var image = document.getElementById('cameraPic');
	    image.src = imageData;
	    sPicData  = imageData; //store image data in a variable
		userId = $('#user_id').val();
		photoUpload(userId);
	}

	function picOnFailure(message){
	    //alert('Failed because: ' + message);
	}

	// ----- upload image ------------
	function photoUpload(userId) {
	    var options = new FileUploadOptions();
	    options.fileKey = "file";
	    options.fileName = sPicData.substr(sPicData.lastIndexOf('/') + 1);
	    options.mimeType = "image/jpeg";
	    options.chunkedMode = false;

	    var params = new Object();
	    params.fileKey = "file";
	    options.params = {}; // eig = params, if we need to send parameters to the server request
	    ft = new FileTransfer();
	    ft.upload(sPicData, "https://www.nd2nosmart.cards/nd2no/admin/user-photo/"+userId, win, fail, options);

	}

	function win(r){
		
		/*------------ Images upload -----------*/

		
	    //alert(r.response);
	    //alert(r.responseCode);
	    //alert(r.bytesSent);
	    //alert("image uploaded scuccesfuly");
	}

	function fail(error){
	   //alert("An error has occurred: Code = " = error.code);
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
				
	 			$.post(
					"https://www.nd2nosmart.cards/nd2no/admin/web-update-profile",
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
							setTimeout(function() {
								$('.errorMsgShow').hide();
								viewProfile();
							}, 4000);	
							
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
				"https://www.nd2nosmart.cards/nd2no/admin/web-show-favourites",
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

								var cardImages = (row.banner)?row.banner:'';
								$('.favoritelistHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img  onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="'+tickiconImg+'" alt=""></a> <a href="javascript:void(0);" onClick="removeFavorite('+row.card_favourite_id+');" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						$('.favoritelistloader').hide();
					} else {
						$('.favoritelistloader').hide();
						$(".errorMsgShow").show();
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-remove-favourite-card",
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
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(resultArr.error);	
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
				}
			}
		) 
	}


	/*--------- Card List-----------*/
	function cardlist() {
		
	 	$('.card-list-new').remove();
		$('.cardslistemptyHtml').empty();	  
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$('.cardlistloader').show();
			$.post(
				"https://www.nd2nosmart.cards/nd2no/admin/web-user-cards",
				{
				  user_id: user_id,
				},
				function(cardlist,status){
					var countid = 0;
					var cardlistArr = jQuery.parseJSON(cardlist);
					if(!cardlistArr.error) {
						$.each(cardlistArr, function(i, row1) {
							countdata = row1.length;
							$.each( row1, function(j, row) {
								var htmlidclass = ''
								countid++;
								if(countid==countdata){
									var htmlidclass = 'id="card-list" data-url="card-list"';
								}
								/*----------- card image check --------*/
								var cardImages = (row.banner)?row.banner:'';
								shareUrl = "https://www.nd2nosmart.cards/nd2no/card/"+row.post_key+"-"+row.id+"/mobile";
								$('#card-scroller').after('<div data-role="page" class="jqm-demos jqm-page jqm-list card-list-new" '+htmlidclass+'><div data-role="header" class="jqm-header"><div class="left-icon"><a href="javascript:void(0)" onclick="cardlist()" class="back-button"><img src="images/back-icon.png" alt=""></a><a href="javascript:void(0);" onclick="notificationList()" class="bell-button"><img src="images/bell-icon.png" alt=""> <span class="counter counter-notify counter-notify-2">0</span></a></div><div class="right-icon"><a href="javascript:void(0);" onclick="navigationOpen()" class="jqm-navmenu-link1 menu-button ui-link"><img src="images/menu-icon.png" alt=""></a></div><h1 class="title">My Cards</h1></div><div role="main" class="ui-content jqm-content"><div class="dashboard-link" style="border-bottom:0px;"><a class="ui-link" href="javascript:void(0);" onclick="cardlist()"><span class="img"><img class="responsimg" src="images/dashboard.png" alt=""></span></a><a class="ui-link" href="javascript:void(0);" onclick="viewProfile()"><span class="img"><img class="responsimg" src="images/profile-icon.png" alt=""></span></a><a class="ui-link" href="javascript:void(0);" onclick="selectcardShow()"><span class="img"><img class="responsimg" src="images/share.png" alt=""></span></a><a class="ui-link" href="javascript:void(0);" onclick="myfolderList()"><span class="img"><img class="responsimg" src="images/my-folder.png" alt=""></span></a></div><div class="card-listnew"><div class="card-box"><div  style="margin-top: -25px;" class="img"><a href="javascript:void(0);" onclick="previewslide()" class="ui-icon-arrow-l ui-btn-icon-left arrowiconleft"></a><a onclick="nextslide()" href="javascript:void(0);" class="ui-icon-arrow-r ui-btn-icon-right arrowiconrigth"></a><img width="100%" alt="" src="'+cardImages+'"></div></div></div><div class="card-listnew2"><div data-role="controlgroup" data-type="vertical"><div class="bgbuttonnew"><a href="javascript:void(0);" onclick="window.plugins.socialsharing.share(\''+row.title+'\', null, \''+cardImages+'\', \''+shareUrl+'\')" data-role="button" class="icon-share" data-icon="share">Share</a></div><div class="bgbuttonnew"><a href="javascript:void(0);" data-role="button" onClick="cartDetails('+row.id+')" class="icon-view" data-icon="view">View</a></div><div class="bgbuttonnew" onClick="showEditcard()"><a href="javascript:void(0);" data-role="button" class="icon-newedit" data-icon="newedit">Edit</a></div><a href="javascript:void(0);" onclick="editscroller('+row.id+')" class="ui-btn editshow-icon" style="display:none;">Text Scroll</a><a href="javascript:void(0);" onclick="cardLink('+row.id+')" class="ui-btn editshow-icon" style="display:none;">Links</a></div></div></div><div data-role="footer" data-position="fixed" data-tap-toggle="false" class="jqm-footer"><div class="rewards-line"><a href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy\',\'_system\');" >Get a SmartCard</a></div></div><div data-role="panel" class="menu-new main-menu jqm-navmenu-panel" data-position="right" data-display="overlay"><ul class="jqm-list ui-alt-icon ui-nodisc-icon"><li><a href="javascript:void(0);" onclick="cardlist()">Dashboard</a></li><li><a href="javascript:void(0);" onClick="viewProfile()" data-ajax="false">My Profile</a></li><li><a href="javascript:void(0);" onclick="selectcardShow()" data-ajax="false">Share</a></li><li><a href="javascript:void(0);" onclick="myfolderList()" data-ajax="false">My Folders</a></li><li><a href="#change-password" data-ajax="false">Change Password</a></li><li><a href="javascript:void(0);" onClick="logout();" data-ajax="false">Logout</a></li></ul></div></div>');
							});
						});
						$.mobile.changePage("#card-list",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
						$('.cardlistloader').hide();
					} else {
						$('.cardlistloader').hide();	
						$(".errorMsgShow").show();
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						$('.cardslistemptyHtml').append('<p> Please <a href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy\', \'_system\');" class="tick-button ui-link">Click here</a> to create your new card (Regular user) or <a href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae\', \'_system\');" class="tick-button ui-link">Click here</a> (Account Executive).</p>');
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);
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
				"https://www.nd2nosmart.cards/nd2no/admin/web-user-cards",
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
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);
						$('.basiccardslistHtml').append('<p> Please <a href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy\', \'_system\');" class="tick-button ui-link">Click here</a> to create your new card (Regular user) or <a href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae\', \'_system\');" class="tick-button ui-link">Click here</a> (Account Executive).</p>');
						
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
				"https://www.nd2nosmart.cards/nd2no/admin/web-folder-list",
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
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(folderArr.error);	
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);
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
				"https://www.nd2nosmart.cards/nd2no/admin/web-folder-moveto",
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
							cardlist();
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
					"https://www.nd2nosmart.cards/nd2no/admin/web-show-folders",
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
					"https://www.nd2nosmart.cards/nd2no/admin/web-show-folders",
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
				"https://www.nd2nosmart.cards/nd2no/admin/web-user-cards",
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
							 	$('.cardslistHtml').append('<div class="card-box"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="'+tickiconImg+'" alt=""></a><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="editCard('+row.id+');" src="images/edit-icon.png" alt=""></a></div><div class="img"><img width="100%" src="'+cardImages+'" alt=""></div></div>');
							});
						});
						 $('.cardlistloader').hide();
					} else {
						$('.cardlistloader').hide();	
						$(".errorMsgShow").removeClass("success");
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						$('.cardslistHtml').append('<p> Please <a href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy\', \'_system\');" class="tick-button ui-link">Click here</a> to create your new card (Regular user) or <a href="javascript:void(0);" onclick="window.open(\'https://www.nd2nosmart.cards/nd2no/ordermy-ae\', \'_system\');" class="tick-button ui-link">Click here</a> (Account Executive).</p>');
					}
				}
			)
		}  
	}


	/*--------- Shared Card List-----------*/
	function cardLink(cardId){ 
	
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-link-card",{
				card_id: cardId,
			},
			function(profiledetails, status){
				$('.cardlinkremove').remove();
				
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) { 
					
					$.each( profileArr, function(i, row) {
						
						var title   		= row.card.title;
						var cardImages = row.card.banner;
						var banner_html	= ''; 
						var editcard='<div class="cardlinkremove"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+title+'</h3></div><form name="card_edit_link" id="card_edit_link" enctype="multipart/form-data" method="post"><div class="page-form addnewlink"><input type="hidden" name="add_cardval" id="add_cardval" value="0"><input type="hidden" name="card_id" id="card_id" value="'+cardId+'">'+ banner_html +'';
						var obj=[];
						 
						$.each( row.links, function(i, row2) {
								
							var icon_id_val   	= row2.iconsid;
							var icon_name_val 	= row2.type;	
							var icon_title_link = (row2.title)?row2.title:'';
							var iconDropDown = '<select name="links['+i+'][type]" class="iconUpdate_'+row2.id+' icon_id_list_'+row2.id+'" id="icon_id_'+row2.id+'" style="max-width:100%;"><option id="iconUpdateSpan" value="">Select Icon</option></select>';
							
							editcard +='<div class="ui-input-text ui-body-inherit link removelink_'+row2.id+'"><a class="tick-button ui-link count-iconlist" onclick="deleteCardLink('+row2.id+');" href="javascript:void(0);" style="margin-left: 47%;"><img src="images/delete.png" alt=""></a>'+iconDropDown+'<input type="text" value="'+row2.url+'" id="'+row2.id+'" placeholder="Link" name="links['+i+'][value]"><input type="text" value="'+icon_title_link+'" id="'+row2.id+'" placeholder="Title" name="links['+i+'][title]"></div>';
						
							$.post(
								"https://www.nd2nosmart.cards/nd2no/admin/select-icon-data",
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
							editcard +='</div><a style="float: right; margin: 7px;" onclick="addCardLink();" href="javascript:void(0);">Add New</a><button type="button" onClick="cardLinkSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Save</button></form></div>';
						$('.updateCardLink').append(editcard);
						$('#backbuttoneditliinks').attr('onclick','editCard('+cardId+')');
						$(".updateCardLink").trigger("create");
					
					});
				} else {
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
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
			"https://www.nd2nosmart.cards/nd2no/admin/select-icon-data",
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-update-link",
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
				}
			}
		)
	}	
	
	
	/*--------- Shared Card List-----------*/
	function editscroller(cardId){ 
	
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-scroller-card",{
				card_id: cardId,
			},
			function(profiledetails, status){
				$('.editscrollerremove').remove();
				
				var profileArr = jQuery.parseJSON(profiledetails);
				if(!profileArr.error) { 
					
					$.each( profileArr, function(i, row) {
						scrollChaek = '';
						if(row.scrollers && row.scrollers!=''){
							scrollChaek = (row.scrollers[0].status)?'checked="checked"':'';
						}
						var title   = row.card.title;
						var cardImages = row.card.banner;
						var banner_html	= ''; 
						var editcard='<div class="editscrollerremove"><div class="main-img"><img src="'+cardImages+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+title+'</h3></div><form name="card_edit_scroller" id="card_edit_scroller" enctype="multipart/form-data" method="post"><div class="page-form addnewscroller"><input type="hidden" name="add_cardval_scroller" id="add_cardval_scroller" value="0"><input type="hidden" name="card_id" id="card_id" value="'+cardId+'">'+banner_html +' <label>Check to ACTIVATE Scroller on this card <input style="z-index: 3;" '+scrollChaek+' type="checkbox" name="status" id="status"></label> ';
						var obj=[];
						$.each( row.scrollers, function(i, row2) {
							var scroller_title_link = (row2.title)?row2.title:'';							
							var scroller_title_url  = (row2.url)?row2.url:'';
							editcard +='<div class="ui-input-text ui-body-inherit link removescroller_'+i+'"><a class="tick-button ui-link count-iconlist-scroll" onclick="deleteCardScroller('+i+');" href="javascript:void(0);" style="margin-left: 47%;"><img src="images/delete.png" alt=""></a><input type="text" value="'+scroller_title_link+'" id="'+i+'" placeholder="Link" name="scrollers['+i+'][title]"><input type="text" value="'+scroller_title_url+'" id="'+i+'" placeholder="Url" name="scrollers['+i+'][url]"></div>';
						});
						
						editcard +='</div><a style="float: right; margin: 7px;" onclick="addCardScroller();" href="javascript:void(0);">Add New</a><button type="button" onClick="cardScrollerSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Save</button></form></div>';
						$('.updateCardScroller').append(editcard);
						$('#backbuttoneditcard').attr('onclick','editCard('+cardId+')');
						$(".updateCardScroller").trigger("create");
					
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(profileArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
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
			"https://www.nd2nosmart.cards/nd2no/admin/web-update-scroller",
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
				}
			}
		)
	}
	
	
	
	/*---------------Listing for selected cards--------------*/
	
	function selectcardShow() {	
		
		$('.cardticklistloader').show();			
		if (!localStorage.cartitem){
			var items = '';
		} else {
			var items =localStorage.cartitem;
		}
	
		$.post(
			"https://www.nd2nosmart.cards/nd2no/admin/web-selected-cards",
			{
			  selected_card_ids: items
			},
			function(cardlist,status){
				$('.ticked-list').empty();
				$('.sharecardremove').remove();
				var cardlistArr = jQuery.parseJSON(cardlist);
				if(!cardlistArr.error) {
					cardImages2 = '';
					shareUrl = '';
					card_ids = '';
					$.each( cardlistArr, function(i, row1) {
						$.each( row1.card, function(i, row) {
							var cardImages = (row.banner_thumb)?row.banner_thumb:'';
							$('.ticked-list').append('<li><div class="card-option"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="removeSelected('+row.id+');" src="images/delete-icon.png" alt=""></a></div><div class="img"><img src="'+cardImages+'" alt=""></div></li>');
							card_ids += row.id+'-';
							cardImages2 += "'"+cardImages+"',";
						});
						if(card_ids){
							card_ids = card_ids.substring(0,card_ids.length - 1);
							shareUrl = 'https://www.nd2nosmart.cards/nd2no/mobi-shared/'+card_ids;
						}
						if(cardImages2){
							cardImages2 = cardImages2.substring(0,cardImages2.length - 1);
						}
						$('.sharecardImgdev').after('<a class="sharecardremove ui-btn ui-shadow ui-corner-all" onclick="window.plugins.socialsharing.share(\'Cards To Share\', null, ['+cardImages2+'], \''+shareUrl+'\')" href="javascript:void(0);">Share with</a>');
					});
					
					$('.cardticklistloader').hide();
				} else {
					$('.cardticklistloader').hide();
					$(".errorMsgShow").show();
					$(".errorMsgShow").removeClass("success");
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);
					setTimeout(function() {
						$('.errorMsgShow').hide();
					}, 4000);
					
				}
			}
		);
		$.mobile.changePage("#selected-cards",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
	}
	
	
	/*----------- Notifications List -----------*/
		
	function notificationList() {
				
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			$('.notificationlistloader').show();
			$.post(
				"https://www.nd2nosmart.cards/nd2no/admin/web-notification-list",
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
								if (row.is_share_notify==1){
								$('.notification-list').append('<li><div class="img"><img src="'+cardImages+'" alt=""></div><div class="text">'+row.first_name+' '+row.middle_name+' '+row.last_name+' has shared his “<a href="javascript:void(0);" onClick="cartDetailsNotification('+row.id+');">'+row.title+'</a>” Card with you at '+row.updated_at+'</div></li>');
								} else {
								$('.notification-list').append('<li><div class="img"><img src="'+cardImages+'" alt=""></div><div class="text">'+row.first_name+' '+row.middle_name+' '+row.last_name+' has updated his “<a href="javascript:void(0);" onClick="cartDetailsNotification('+row.id+');">'+row.title+'</a>” Card at '+row.updated_at+'</div></li>');
								}
								
							});
						});
						$('.notificationlistloader').hide();
					} else {
						$(".errorMsgShow").removeClass("success");
						$('.notificationlistloader').hide();
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(cardlistArr.error);
						setTimeout(function() {
							$('.errorMsgShow').hide();
						}, 4000);
					}
				}
			)
			$.mobile.changePage("#notification",{allowSamePageTransition:false,reloadPage:false,changeHash:true,transition:"slide"});
		} 
	}
	
	
	function nextslide(){
		nextpage = $.mobile.activePage.next('.card-list-new');
		if(nextpage.length != 0) {
			$.mobile.changePage(nextpage, {
				transition: "slide",
				reverse: false
			});
		}
	}
	
	function previewslide(){
		prevpage = $.mobile.activePage.prev('.card-list-new');
		if (prevpage.length != 0) {
			$.mobile.changePage(prevpage, {
				transition: "slide",
				reverse: true
			});
		}
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
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
	}
	
	function onSuccesscon(full_name) {
		full_name = (full_name)?full_name:'Card'; 
		showAlert(full_name+" has been added to your contacts!")
	}

	function onErrorcom() {
		showAlert("Oops Something went wrong! Please try again later.");
	} 

	// onError: Failed to get the contacts

	function onErrorchek(contactError) {
		showAlert("Oops Something went wrong! Please try again later.");
	}
	
	
	function alertDismissed() {
		// do something
	}

	
    function showAlert(massage) {
        navigator.notification.alert(
            massage,
            alertDismissed,
            'ND2NO',
            'Ok'
        );
    }


 	function createAddnewcontact(first_name,last_name,email,mobile,profilephoto) {
		
		var profilephoto = profilephoto.replace("large", "thumb");
		
		var options = new ContactFindOptions();
		full_name = '';
		if(first_name && last_name){
			full_name = first_name+' '+last_name;
		} else if(first_name!='' && last_name==''){
			full_name = first_name;
		} else if(first_name=='' && last_name!=''){
			full_name = last_name;
		}
		
		options.filter   = full_name;
		options.multiple = true; 
		var fields = ["displayName", "name"];
		
      	navigator.contacts.find(fields, onSuccess, onErrorchek, options);


		function onSuccess(contacts) {
			
           if(contacts.length>0){
                // already exists cheak
                navigator.notification.confirm(
                    'Contact already added. Wish to add again!',  // message
                    function (button) {
                        if(button==1){
                                  
                            var contact = navigator.contacts.create();
                                              
                            contact.name = {givenName: first_name, familyName: last_name};
                            contact.displayName = full_name;
                                               
                            var phoneNumbers = [];
                            phoneNumbers[0] = new ContactField('mobile', mobile, true); // preferred number
                            contact.phoneNumbers = phoneNumbers;
                                               
                            var emails = [];
                            emails[0] = new ContactField('work', email, true); // preferred email
                            contact.emails = emails;
                                               
                            var photos = [];
                            photos[0] = new ContactField('photos',profilephoto,true); // preferred profile picture
                            contact.photos = photos;
                                               
                            // save to device
                           contact.save(onSuccesscon(full_name),onErrorcom);
                        }
                    },              // callback to invoke with index of button pressed
                    'ND2NO',            // title
                    'OK,Cancel'          // buttonLabels
                );
                //confirmcheak = confirm('Contact already added. Wish to add again!','ND2NO');
            }
            
            if(contacts.length==0){
                
                // create a new contact object
				var contact = navigator.contacts.create();

				contact.name = {givenName: first_name, familyName: last_name};
				contact.displayName = full_name;

				var phoneNumbers = [];
				phoneNumbers[0] = new ContactField('mobile', mobile, true); // preferred number
		    	contact.phoneNumbers = phoneNumbers;

				var emails = [];
				emails[0] = new ContactField('work', email, true); // preferred email
		    	contact.emails = emails;

				var photos = [];
				photos[0] = new ContactField('photos',profilephoto,true); // preferred profile picture
		    	contact.photos = photos;

		    	/*var urls = [];
		    	urls[0] = new ContactField('home','https://www.gmail.com',true); // preferred Url
	        	contact.urls = urls;*/

				// save to device
				contact.save(onSuccesscon(full_name),onErrorcom);
			}  	
		};
   }
	
	
	

	$(document).ready(function(){
 
		/*------------ Cheak Login -------------*/
		user_id = localStorage.getItem('userid');
		if(user_id==null || user_id==''){
			user_id = localStorage.getItem('userid-2');
		}
		if(user_id){
			if(localStorage.getItem('email')) {
				cardlist();
			}
		}
		/*------------ End cheak login -------------*/
		
		$('div.ui-page').live("swipeleft", function () {
			nextpage = $.mobile.activePage.next('.card-list-new');
			if(nextpage.length != 0) {
 				$.mobile.changePage(nextpage, {
					transition: "slide",
					reverse: false
				});
			}
		});
		
		$('div.ui-page').live("swiperight", function () {
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
					"https://www.nd2nosmart.cards/nd2no/admin/web-register",
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
		/*$(document).on('pagebeforeshow', '#index', function(){ 
			alert('hello');
			user_id = localStorage.getItem('userid');
			if(user_id==null || user_id==''){
				user_id = localStorage.getItem('userid-2');
			}
			if(user_id){
				if(localStorage.getItem('email')) {
					$.post(
						"https://www.nd2nosmart.cards/nd2no/admin/web-show-folders",
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
					//pushNotify();
					cardlist();
				}
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
					"https://www.nd2nosmart.cards/nd2no/admin/web-create-folder",
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
							"https://www.nd2nosmart.cards/nd2no/admin/web-show-folders",
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
				"https://www.nd2nosmart.cards/nd2no/admin/web-forget-password",
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
		$(document).on('pagebeforeshow', function() {
			
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
					"https://www.nd2nosmart.cards/nd2no/admin/web-notification-total",
					{
					  user_id: user_id
					},
					function(countcard,status){
						var cardCount = jQuery.parseJSON(countcard);
						$('.counter-notify').text(cardCount.success);
						if(cardCount.notify){
                            if(cardCount.success) {
								$.post(
									"https://www.nd2nosmart.cards/nd2no/admin/web-show-folders",
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
										}
									}
								); 
							}
						}
					}
				);
			} else {
				//$.mobile.changePage("#login");
			}
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
						"https://www.nd2nosmart.cards/nd2no/admin/web-cahnge-password",
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
								cardlist();
							}
						}
					)
				}  
			}
		});
	});
	
	
	$(document).on('pageshow', '[data-role="page"]', function() {
		loading('hide', 1000);
	});
 