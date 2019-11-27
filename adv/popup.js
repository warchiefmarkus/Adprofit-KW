





function test_ext() {
	test_one();
}

function test_one() {
	$('#test_result').text('');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      	chrome.tabs.sendMessage(tabs[0].id, {type: "need_test_ext"}, function(response) {
      		if (!response) {
      			$('#test_result').text('-> Дождитесь загрузки сайта.');
      		}
      		response = JSON.parse(response);
      		console.log(response);
        	if (response.selectors && response.box && response.banners)
        		$('#test_result').text('-> Расширение работает.');

        	else if(response.selectors === 0)
        		$('#test_result').text('-> Нет селекторов.');

        	else if(response.box === 0)
        		$('#test_result').text('-> Не вижу рекламы.');

        	else if(response.banners === 0)
        		$('#test_result').text('-> Нет подходящих баннеров.');

        	else 
        		$('#test_result').text('-> Неизвестная ошибка.');

        	setTimeout(function(){
        		$('#test_result').text('');
        	}, 2000);

      	});
    });
}

function test_two() {
	
}

function test_three() {
	
}

function test_four() {
	
}

function test_five() {
	
}










$(document).ready(function(){
	$.ajax({
        type: "GET",
        url: "https://advprofit.ru/get/getpopupdata",
        data: ({    
           method: 'getpopupdata',
			t: (new Date()).valueOf()
        }),       
        success: function(msg){
             
          msg = JSON.parse(msg);            
                           
          if (!msg.error) {  
          	$('#user_id').html(msg.data.id);
          	$('#user_email').html(msg.data.email);
          	$('#user_balance').html(Math.floor(msg.data.balance*100)/100);
          	$('#user_referal').html(msg.data.count_referal);
          	$('#user_view').html(msg.data.count_view);
          	$('#user_reward').html(msg.data.reward_today);
          	$('#user_reward_referal').html(msg.data.reward_today_referal);
          	var ld = new Date();
          	$('#current_date').html(ld.toLocaleDateString())
          	if (msg.data.replace_banner == 1) {
	          	$('#btn-stop').css('display', 'inline-block'); 
              chrome.storage.local.set({'replace_banner': 1});
      			} else {				
      	      $('#btn-start').css('display', 'inline-block');  
      			}

          	$('#preloader').css('display', 'none');
          	$('#content').css('display', 'block');
            
          } else if (msg.type == 1) {
          	$('#preloader').css('display', 'none');
          	$('#login_button_block').css('display', 'block');            
          } else {
            alert('Неизвестная ошибка!');
          }
      	}      
  	});

  	$('#btn-stop').on('click', function(){
  		$.ajax({
	        type: "GET",
	        url: "https://advprofit.ru/get/stopview",
	        data: ({    
	           method: 'stopview'
	        }),       
	        success: function(msg){
	             
	          msg = JSON.parse(msg);            
	                           
	          if (!msg.error) {  
	          	$('#btn-stop').css('display', 'none');  
	          	$('#btn-start').css('display', 'inline-block'); 
	          	chrome.storage.local.set({'replace_banner':0});
	          } else if (msg.type == 1) {
	          	$('#preloader').css('display', 'none');
	          	$('#content').css('display', 'none');
	          	$('#login_button_block').css('display', 'block');            
	          } else {
	            alert('Неизвестная ошибка!');
	          }
	      	}      
  		});
  	});

  	$('#btn-start').on('click', function(){
  		$.ajax({
	        type: "GET",
	        url: "https://advprofit.ru/get/startview",
	        data: ({    
	           method: 'startview'
	        }),       
	        success: function(msg){
	             
	          msg = JSON.parse(msg);            
	                           
	          if (!msg.error) {  
	          	$('#btn-start').css('display', 'none');  
	          	$('#btn-stop').css('display', 'inline-block'); 	          	
	          	chrome.storage.local.set({'replace_banner':1});
	          } else if (msg.type == 1) {
	          	$('#preloader').css('display', 'none');
	          	$('#content').css('display', 'none');
	          	$('#login_button_block').css('display', 'block');            
	          } else {
	            alert('Неизвестная ошибка!');
	          }
	      	}      
  		});
  	});

  	$('.btn_visible_email').on('click', function(){
  		if ($('.btn_visible_email').hasClass('show_email')) {
  			$('.btn_visible_email').removeClass('show_email').addClass('hide_email').text('показать email');
  			$('#user_email').hide();
  		} else {
  			$('.btn_visible_email').removeClass('hide_email').addClass('show_email').text('скрыть');
  			$('#user_email').show();
  		}
  	});

  	$('#test_btn').on('click', function(){
  		test_ext();
  	});

    // var_uIAD = setTimeout(function updateIntervalAdData(){
    //   getAdData();
    //   console.log('update');
    //   var_uIAD = setTimeout(updateIntervalAdData, 3000);
    // }, 3000);
});