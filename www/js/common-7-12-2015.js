	/*---------- Display cards in folder------*/
function showFoldercards(folderId) { 
	
	$.mobile.changePage("#card-list");
		$.post(
			"http://192.168.1.5/nd2no/admin/web-folder-cards",
			{
			  folder_id: folderId,
			},
			function(cardlist,status){
				$('.allcardlist').remove();
				var cardlistArr = jQuery.parseJSON(cardlist);
				if(!cardlistArr.error) {
					$.each( cardlistArr, function(i, row1) {
						$.each( row1, function(i, row) {
							$('.cardslistHtml').append('<div class="card-box allcardlist"><div class="card-option-open"><a href="#card-details" class="tick-button ui-link"><img src="images/eye-icon.png" alt=""></a><a href="" class="tick-button ui-link"><img src="images/edit-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="images/tick-icon-black.png" alt=""></a> <a href="" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="http://192.168.1.5/nd2no/upload/cards/large/'+row.banner+'" alt=""></div></div>');
						});
					});
				} else {						
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);						
				}
			}
		)

}


/*---------- Add card to cart------*/
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
		
			
/*---------- Remove card selected------*/
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
			$('.Allselectedcards').remove();
			var cardlistArr = jQuery.parseJSON(cardlist);
		
		
		if(!cardlistArr.error) {
				$.each( cardlistArr, function(i, row1) {
					$.each( row1, function(i, row) {				
						$('.ticked-list').append('<li class="Allselectedcards"><div class="card-option"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="removeSelected('+row.id+');" src="images/delete-icon.png" alt=""></a></div><div class="img"><img src="http://192.168.1.5/nd2no/upload/cards/large/'+row.banner+'" alt=""></div></li>');
					
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
	$.mobile.changePage("#selected-cards");

}


/*----------- card details ---------*/
function cartDetails(cardId) {
	
	$.post(
		"http://192.168.1.5/nd2no/admin/web-cards-detail",
		{
		  id: cardId
		},
		function(cardDetails,status){
			
			$('.allfoldert').remove();
			var cardDetailsArr = jQuery.parseJSON(cardDetails);
			
			$(".card-link-details>div").remove();
			$(".allsociallink").remove();
			
			$.each( cardDetailsArr, function(i, firstRow) {	
				$('.card-link-details').append('<input type="hidden" name="sharecard_id" id="sharecard_id" value="'+firstRow[0].id+'"><div class="main-img"><img src="http://192.168.1.5/nd2no/upload/cards/large/'+firstRow[0].banner+'" width="100%" alt=""></div><div class="card-header"><div class="pull-right"><a href="#shareCarddetails" data-rel="popup"><button class="ui-btn ui-shadow ui-corner-all"><img src="images/share-icon.png" alt=""></button></a></div><h3 class="title">'+firstRow[0].title+'</h3></div><div class="card-icons"><a class="ui-link" href=""><img src="images/fb-icon.png" alt=""></a><a class="ui-link" href=""><img src="images/twitter-icon.png" alt=""></a><a class="ui-link" href=""><img src="images/instagram-icon.png" alt=""></a><a class="ui-link" href=""><img src="images/globe-icon.png" alt=""></a><a class="ui-link" href=""><img src="images/video1-icon.png" alt=""></a><a class="ui-link" href=""><img src="images/video2-icon.png" alt=""></a><a class="ui-link" href=""><img src="images/video3-icon.png" alt=""></a></div>');
			});
			
			$.each( cardDetailsArr, function(i, row1) {
				$.each( row1, function(i, row) {
					$('.card-link-details2').append('<ul class="card-details allsociallink"><li><div class="img"><img src="images/fb-icon.png" alt=""></div><div class="title"><a class="ui-link" href="'+row.card_value+'" target="_blank">My Facebook Profile</a></div></li></ul>');
				});
			});
		 
			
			 
		}
	);
	$.mobile.changePage("#card-details");
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
	//var array = sharecard_id.split(",");
	
	$.post(
		"http://192.168.1.5/nd2no/admin/web-share-cards",
		{
		  email: email,
		  card_id: sharecard_id,
		},
		function(data,status){
			
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
				}, 4000);	
				 
			}
		}
	);
}


function viewProfile(){
	$.post(
		"http://192.168.1.5/nd2no/admin/web-user-info",
		{
		  id: globalVar,
		},
		function(profiledetails,status){
			$('.Allprofileview').remove();
			var profileArr = jQuery.parseJSON(profiledetails);
			if(!profileArr.error) {
				$.each( profileArr, function(i, row) {
					var nameUser    = row.first_name+' '+row.middle_name+' '+row.last_name;
					var genderUser  = (row.gender==1)?'Male':'Female';
					var street_1    = (row.street_1!='')?row.street_1+' ':''; 
					var street_2    = (row.street_2!='')?row.street_2+', ':'';
					var state       = (row.state!='')?row.state+', ':'';
					var city        = (row.city!='')?row.city+', ':'';
					var zip         = (row.zip!='')?row.zip+' ':'';
					var country     = (row.name!='')?row.name+' ':'';
					var addressUser = street_1+street_2+city+state+country+zip;
					var photoUser   = (row.photo && row.photo!='')?'http://192.168.1.5/nd2no/upload/users/profile-photo/resized/'+row.photo+'':'images/blank_profile.png';
					
					$('.ProfileUpdate').append('<div class="Allprofileview"><div class="main-img"><img src="'+photoUser+'" width="100%" alt=""></div><div class="card-header"><div class="pull-right"><button onClick="changeProfile('+row.id+')" class="ui-btn ui-shadow ui-corner-all"><img src="images/edit-icon.png" width="24" alt=""></button></div><h3 class="title">'+row.uid.toUpperCase()+' – '+nameUser+'</h3><p>'+row.email+'</p><p>'+row.mobile+'</p></div><div class="page-form"><h3 class="title">Other Details</h3><p><b>Dob: </b>'+row.dob+'</p><p><b>Gender: </b>'+genderUser+'</p><p><b>Address: </b>'+addressUser+'</p><p><b>About You: </b>'+row.about_you+'</p></div></div>');
				});
			} else {
				$(".errorMsgShow").show();
				$(".errorMsgShow").addClass("error");
				$(".errorMsgShow").text(profileArr.error);
			}
			$.mobile.changePage("#my-profile");
		}
	)
}


function changeProfile(id){
	$.post(
		"http://192.168.1.5/nd2no/admin/web-user-info",
		{
		  id: id,
		},
		function(profiledetails,status){
			$('.Allprofileview').remove();
			var profileArr = jQuery.parseJSON(profiledetails);
			if(!profileArr.error) {
				$.each( profileArr, function(i, row) {
					var nameUser     = row.first_name+' '+row.middle_name+' '+row.last_name;
					var genderMale   = (row.gender==1)?'selected':'';
					var genderFemale = (row.gender==2)?'selected':'';
					var photoUser    = (row.photo && row.photo!='')?'http://192.168.1.5/nd2no/upload/users/profile-photo/resized/'+row.photo+'':'images/blank_profile.png';
					
					$('.EditProfile').append('<div class="Allprofileview"><div class="main-img"><img src="'+photoUser+'" width="100%" alt=""></div><div class="card-header"><h3 class="title">'+row.uid.toUpperCase()+' – '+nameUser+'</h3><p>'+row.email+'</p></div><form name="editprofile" id="editprofile" enctype="multipart/form-data" method="post"><div class="page-form"><input type="hidden" name="user_id" id="user_id" value="'+row.id+'"><input type="text" name="first_name" placeholder="First Name" id="first_name" value="'+row.first_name+'"><input type="text" name="middle_name" placeholder="Middle Name" id="middle_name" value="'+row.middle_name+'"><input type="text" name="last_name" placeholder="Last Name" id="last_name" value="'+row.last_name+'"><input type="text" name="dob" placeholder="DOB" id="dob" value="'+row.dob+'"><select name="gender" id="gender"><option '+genderMale+' value="1">Male</option><option '+genderFemale+' value="2">Female</option></select><input type="text" name="street1" placeholder="Street" id="street1" value="'+row.street_1+'"><input type="text" name="street2" placeholder="Landmark" id="street2" value="'+row.street_2+'"><input type="text" name="city" placeholder="City" id="city" value="'+row.city+'"><input type="text" name="zip" placeholder="Zip / Postal Code" id="zip" value="'+row.zip+'"><input type="text" name="state" placeholder="State" id="state" value="'+row.state+'"><select class="countryUpdate"><option>Country</option></select><input type="text" name="phone" placeholder="Phone" id="phone" value="'+row.phone+'"><input type="text" name="mobile" placeholder="Mobile" id="mobile" value="'+row.mobile+'"></div><button onClick="EditProfileSubmit()" class="ui-btn ui-btn-submit ui-corner-all">Edit Profile</button></form></div>');
				 
					$.post(
						"http://192.168.1.5/nd2no/admin/select-countries-data",
						function(countryData,status){									
							$('.Allcountryview').remove();
							var countryArr = jQuery.parseJSON(countryData);									
							$.each( countryArr, function(i, row1) {
								$.each( row1, function(i, row) {
									//$('.countryUpdate').append('<option class="Allcountryview" value="'+row.id+'">'+row.name+'</option>');
								});
							});
						}
					)
				
				});
			} else {
				$(".errorMsgShow").show();
				$(".errorMsgShow").addClass("error");
				$(".errorMsgShow").text(profileArr.error);
			}
			$.mobile.changePage("#update-profile");
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
			},
			mobile: {
				required: true,
				digits: true
			},
		},
		messages: {
			first_name: {
				required: "Please enter your first name."
			},
			phone: {
				required: "Please enter your phone."
			},
			mobile: {
				required: "Please enter your mobile."
			} 
		},
		errorPlacement: function (error, element) {
			error.appendTo(element.parent().add());
		},
		submitHandler:function (form) {				
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



$(document).ready(function(){

	/*--------- Register -----------*/  
	$('#register_form').validate({
		rules: {
			first_name: {
				required: true
			},
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
			first_name: {
				required: "Please enter your first name."
			},
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
						$.mobile.changePage("#login");	
					}
				}
			)
		}
	});
	
	
	
				
	/*--------- Login -----------*/  
	$("#home-login").click(function() {
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
				
					window.globalVar = field.id;							
					if($('#keep_me_login').is(":checked")) {
						localStorage.setItem('email', field.email);
						localStorage.setItem('userid', field.id);
					}
				
					$.post(
						"http://192.168.1.5/nd2no/admin/web-show-folders",
						{
						  user_id: field.id
						},
						function(folderlist,status){
							$('.allfoldert').remove();
							var folderlistArr = jQuery.parseJSON(folderlist);									
							$.each( folderlistArr, function(i, row1) {
								$.each( row1, function(i, row) {
									$('#folder_list').append('<li class="allfoldert"><a href="javascript:void(0);" onClick="showFoldercards('+row.id+');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
								});
							});
						}
					);
					$.mobile.changePage("#dashboard");
				
				} else {
					if(dataArray.error){
						$(".errorMsgShow").show();
						$(".errorMsgShow").addClass("error");
						$(".errorMsgShow").text(dataArray.error);
					}		
				}					
			});					
		});
	});
	
	
	/*--------- Page Before Show -----------*/
	$(document).on('pagebeforeshow', '#login', function(){   
		if(localStorage.getItem('email')) {
			window.globalVar = localStorage.getItem('userid');
			$.post(
				"http://192.168.1.5/nd2no/admin/web-show-folders",
				{
				  user_id: globalVar
				},
				function(folderlist,status){
					$('.allfoldert').remove();
					var folderlistArr = jQuery.parseJSON(folderlist);									
					$.each( folderlistArr, function(i, row1) {
						$.each( row1, function(i, row) {
							$('#folder_list').append('<li class="allfoldert"><a href="javascript:void(0);" onClick="showFoldercards('+row.id+');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
						});
					});
				}
			);				
			$.mobile.changePage("#dashboard");
		}
	});
	
	/*--------- Folder Save-----------*/
	$("#folder_save").click(function(){			
		$.post(
			"http://192.168.1.5/nd2no/admin/web-create-folder",
			{
			  user_id: globalVar,
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
					  user_id: globalVar
					},
					function(folderlist,status){							
						$('.allfoldert').remove();
						var folderlistArr = jQuery.parseJSON(folderlist);									
						$.each( folderlistArr, function(i, row1) {
							$.each( row1, function(i, row) {
								$('#folder_list').append('<li class="allfoldert"><a href="javascript:void(0);" onClick="showFoldercards('+row.id+');"  class="folderhyper">'+row.folder_name+'<span class="counter">('+row.cards+')</span></a></li>');
							});
						});
					}
				);
			}
		);
	});
	
	/*--------- Card List-----------*/
	$("#cardlist").click(function(){
		$.mobile.changePage("#card-list");
		$.post(
			"http://192.168.1.5/nd2no/admin/web-user-cards",
			{
			  user_id: globalVar,
			},
			function(cardlist,status){
				$('.allcardlist').remove();
				var cardlistArr = jQuery.parseJSON(cardlist);
				if(!cardlistArr.error) {
					$.each( cardlistArr, function(i, row1) {
						$.each( row1, function(i, row) {
							$('.cardslistHtml').append('<div class="card-box allcardlist"><div class="card-option-open"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="cartDetails('+row.id+');" src="images/eye-icon.png" alt=""></a><a href="" class="tick-button ui-link"><img src="images/edit-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="images/tick-icon-black.png" alt=""></a> <a href="" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="http://192.168.1.5/nd2no/upload/cards/large/'+row.banner+'" alt=""></div></div>');
						});
					});
				} else {						
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);						
				}
			}
		)
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
					$.mobile.changePage("#login");
				}
			}
		)
	});
	
	
	/*----------- Notifications Count -----------*/
	$(document).on('pagebeforeshow', function(){  
		
		setTimeout(function() {
			$('.errorMsgShow-2').hide();
		}, 4000);
	
		$(".errorMsgShow").hide();		
		if (!localStorage.cartcount){
		var itemcount = 0;
		} else {
		var itemcount =localStorage.cartcount;
		}
		$('.counter-cardtick').text(itemcount);
		if(localStorage.getItem('email')) {
			window.globalVar = localStorage.getItem('userid');
			$.post(
				"http://192.168.1.5/nd2no/admin/web-notification-total",
				{
				  user_id: globalVar
				},
				function(countcard,status){
					var cardCount = jQuery.parseJSON(countcard);
					$('.counter-notify').text(cardCount.success);
				}
			);
		}
	});
	
	/*----------- Notifications List -----------*/
	$(".counter-notify").click(function(){
		$.mobile.changePage("#notification");
		$.post(
			"http://192.168.1.5/nd2no/admin/web-notification-list",
			{
			  user_id: globalVar,
			},
			function(cardlist,status){
				$('.Allsharedcards').remove();
				var cardlistArr = jQuery.parseJSON(cardlist);
				if(!cardlistArr.error) {
					$.each( cardlistArr, function(i, row1) {
						$.each( row1, function(i, row) {							
							$('.notification-list').append('<li class="Allsharedcards"><div class="img"><img src="http://192.168.1.5/nd2no/upload/cards/thumb/'+row.banner+'" alt=""></div><div class="text">'+row.first_name+' '+row.middle_name+' '+row.last_name+' has updated his “<a href="#card-details">'+row.title+'</a>” Card at '+row.updated_at+'</div></li>');
						});
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);
				}
			}
		)
	});
	
	
		/*---------------Listing for selected cards--------------*/
	
	$(".counter-cardtick").click(function(){
		$.mobile.changePage("#selected-cards");
		
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
				$('.Allselectedcards').remove();
				var cardlistArr = jQuery.parseJSON(cardlist);
			
			
			if(!cardlistArr.error) {
					$.each( cardlistArr, function(i, row1) {
						$.each( row1, function(i, row) {				
							$('.ticked-list').append('<li class="Allselectedcards"><div class="card-option"><a href="javascript:void(0);" class="tick-button ui-link"><img onClick="removeSelected('+row.id+');" src="images/delete-icon.png" alt=""></a></div><div class="img"><img src="http://192.168.1.5/nd2no/upload/cards/large/'+row.banner+'" alt=""></div></li>');
						
						});
					});
				} else {
					$(".errorMsgShow").show();
					$(".errorMsgShow").addClass("error");
					$(".errorMsgShow").text(cardlistArr.error);
				}
			}
		)
	});
	
	
	
	/*--------- Favorite List-----------*/
	$("#favoritelist").click(function(){
		$.mobile.changePage("#favorite-list");
		$.post(
			"http://192.168.1.5/nd2no/admin/web-show-favourites",
			{
			  user_id: globalVar,
			},
			function(cardlist,status){
				$('.allfavoritelist').remove();
				var cardlistArr = jQuery.parseJSON(cardlist);
				if(!cardlistArr.error) {
					$.each( cardlistArr, function(i, row1) {
						$.each( row1, function(i, row) {
							$('.favoritelistHtml').append('<div class="card-box allfavoritelist"><div class="card-option-open"><a href="#card-details" class="tick-button ui-link"><img src="images/eye-icon.png" alt=""></a><a href="" class="tick-button ui-link"><img src="images/edit-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" id="cd_'+row.id+'" class="tick-button ui-link"><img class="cardclass_'+row.id+'" src="images/tick-icon-black.png" alt=""></a> <a href="" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="http://192.168.1.5/nd2no/upload/cards/large/'+row.banner+'" alt=""></div></div>');
						  //$('.favoritelistHtml').append('<div class="card-box allfavoritelist"><div class="card-option-open"><a href="#card-details" class="tick-button ui-link"><img src="images/eye-icon.png" alt=""></a><a href="" class="tick-button ui-link"><img src="images/edit-icon.png" alt=""></a><a href="javascript:void(0);" onClick="addCart('+row.id+');" class="tick-button ui-link"><img src="images/tick-icon-black.png" alt=""></a> <a href="" class="tick-button ui-link"><img src="images/delete-icon.png" alt=""></a></div><div class="img"><img width="100%" src="http://192.168.1.5/nd2no/upload/cards/large/'+row.banner+'" alt=""></div></div>');
						});
					});
				} else {
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
			$.post(
				"http://192.168.1.5/nd2no/admin/web-cahnge-password",
				{
				  current_password: $("#current_password").val(),
				  password: $("#new_password").val(),
				  password_confirmation: $("#password_confirmation").val(),
				  user_id: globalVar
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
						$.mobile.changePage("#dashboard");								 
					}
				}
			)
		}
	});
	
	
	/*----------- Logout -----------*/
	$("#logout").click(function(){
		window.localStorage.clear();
		window.globalVar = '';
		$.mobile.changePage("#login");
	});
	
	

});