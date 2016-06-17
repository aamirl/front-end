// 'use strict';

AWS.config.update({
        accessKeyId: 'AKIAIZYV5W77V235JRWQ',
        secretAccessKey: '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'
    });
AWS.config.region = 'us-west-1';
var bucket = new AWS.S3({
    params: {
        Bucket: 'sellyx-ecom'
    }
});
// var ROOT_COUNTRIES;
// $.getJSON('views/pieces/countries/all.json', function(json) {
//    ROOT_COUNTRIES = json;
// });
var ROOT_CURRENCIES;
$.getJSON('assets/js/currencies.json', function(json) {
   ROOT_CURRENCIES = json;
});
var KEY_GLO;
var SELLER_PATH;
var USER_PATH;
//$http.get('views/pieces/countries/all.json').then(function(obj){ROOT_COUNTRIES = obj.data;},function(obj){console.log("Can not load countries")});

//Dropzone.autoDiscover = false;

//var myDropzone = new Dropzone("#sellerImages", { url: "/upload"})
var resizeImgList = [];
var canvas = document.createElement('canvas');
	
var ROOT_CONFIG_PATH = 'https://ec.sellyx.com/';

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
    }
String.prototype.replaceAll = function(target, replacement){
    var re = new RegExp(target, 'g');
    return this.replace(re, replacement);
    }
String.prototype.nl2br = function(){
    return this.replace(/\n/g , '<br />');
    }
Array.prototype.max = function() {
        return Math.max.apply(null, this);
        };
Array.prototype.min = function() {
    return Math.min.apply(null, this);
    };

$(document).on('ready', function(){
	$('.nav-tabs.main a:first').tab('show');

	$(document)
		.on('hide.bs.modal','.modal',function(){
			$('.modal-backdrop').remove();
			$('body').removeClass('modal-open');
			})
		.ajaxError(function(event, jqxhr, settings, thrownError){
    		alertify.alert('There was a server error. Please wait a few minutes before trying again. If this message keeps appearing, please contact Sellyx.');
    		})
		.on('click', '.logout-button', function(){
			$.post('/common/handle/logout', function(data){
				location.reload();
				})
			})
		.on('click', '.panel-heading', function(){
	        $(this).siblings('.panel-body').slideToggle();
	        var i = $(this).find('.fa');
	        i.hasClass('fa-caret-up') ? i.removeClass('fa-caret-up').addClass('fa-caret-down') : i.addClass('fa-caret-up').removeClass('fa-caret-down');
	        })
		.on('click','.change-status-button' , function(event){
            event.stopImmediatePropagation();
            if($(this).parents('.child-row').length > 0){
            	var all = Sellyx.row.data($(this).parents('.child-row').parents('tr').prev('tr'));
            	var child = true;
            	}
            else{
            	var all = Sellyx.row.data($(this));
            	var child = false;
            	}

            var g = {
                url : ROOT_CONFIG_PATH + ($(this).data('path')||'') + ($(this).data('method')?$(this).data('method'):'status') ,
                data : '&id=' + all.data.id + '&status=' + $(this).data('status') + ($(this).data('extra') ? '&extra=' + $(this).data('extra') : '' ),
                button : $(this),
                update : {
                    row : all.row
                    },
                success : function(data){
                	
                    }
                }

            if($(this).data('remove')) g.update.remove = true;
            else if($(this).data('merge')) g.update.merge = true;
            else if($(this).data('target')) g.update.target = $(this).data('target');
            g.update.child = child;
            console.log(g);
            Sellyx.ajax.standard(g)
            })
		.on('click', '.sellyx-minus', function(event){
		    event.stopImmediatePropagation();
		    $(this).next('.sellyx-subpanel').slideToggle();
		    })
		.on('click', '.sellyx-left' , function(){
	        var panel = $(this).parent('.sellyx-panel').width();
	        var target = $(this).siblings('.sellyx-subpanel-scroll-a');
	        var left = target.scrollLeft();
	        target.animate({scrollLeft: left - panel}, 400);
	        })
	    .on('click', '.sellyx-right' , function(){
	        var panel = $(this).parent('.sellyx-panel').width();
	        var target = $(this).siblings('.sellyx-subpanel-scroll-a');
	        var right = target.scrollLeft();
	        target.animate({scrollLeft: right + panel}, 400);
	        })
		.on('click', '.toggle-read-more' ,function(event){
			event.stopImmediatePropagation();
			var target = $(this).prev('article');
			if(target.hasClass('hidden-content')){
				target.removeClass('hidden-content').addClass('shown-content');
				$(this).text('Close');
				}
			else{
				target.removeClass('shown-content').addClass('hidden-content');
				$(this).text('Read More' + ($(this).data('extra')?' '+$(this).data('extra'):''));
				}
			})
		.on('click' , '.see-more-div' , function(event){
            event.stopImmediatePropagation();
            var target = $(this).next('div');
            var label = $(this).html();

            if(target.css('display') == 'none'){
                target.slideDown();
                $(this).text(label.replace('See','Hide'));
                }
            else{
                target.slideUp();
                $(this).text(label.replace('Hide','See'));
                }
            })
		.on('keydown', '.data-number , .data-decimal', function(event){
			if($(this).hasClass('data-number')) var arr = [46,8,9,27,13,110];
			else var arr = [46,8,9,27,13,110,190]

			if($.inArray(event.keyCode,arr) !== -1 || (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode >= 35 && event.keyCode <= 39)) {
				return;
				}
			else if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
				event.preventDefault();
				if($(document).find('.alertify-notifier').children().length == 0){
					$.gritter.add({
				        title: 'Error',
				        text: 'Numbers only.',
				        image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png',
				        sticky: false,
				        time: '2500',
				        class_name: '',
				    		})
					}
				}
		    })
		.on('click', '.refresh-button', function(){
			var button = $(this);
			button.addClass('disabled').attr('disabled',true);
		    if($(this).parents('.tab-pane.active').length > 0){
		        var table = $(this).parents('.tab-pane.active').find('.dataTable:last').attr('id');
		        }
		    else{
		        var table = $(this).parents('#content').find('.dataTable:last').attr('id');
		        }

		    $('#'+table).DataTable().ajax.reload(function(){
		    	button.removeClass('disabled').attr('disabled',false);

		    	});
		    })
		// .on('focusout', '.password', function(){
  //   		!Sellyx.check.password($(this).val(), false) ? $(this).addClass('input-error') : null;
  //   		})
		// .on('focusout', '.email', function(){
		//     !Sellyx.check.email($(this).val(), true) ? $(this).addClass('input-error') : null;
		//     })
		.on('focusout', '.input-error', function(){
		    if($(this).hasClass('email')){
		        Sellyx.check.email($(this).val(), false) ? $(this).removeClass('input-error') : null;
		        }
		    else if($(this).hasClass('password')){
		        Sellyx.check.password($(this).val(), false) ? $(this).removeClass('input-error') : null;
		        }
		    else if($(this).hasClass('select2-selection')){
		    	$(this).parents('.select2').prev('select').val()!='' ? $(this).removeClass('input-error') : null;
		    	}
		    else{
		        $(this).val()!='' ? $(this).removeClass('input-error') : null;        
		        }
		    })
		.on('keyup', '.enter', function(event){
			if(event.keyCode == 13){
		        $(this).parents('.enter-container').find('.enter-target').trigger('click');
		        }
		    })
		.on('dblclick', '.select-group', function(){
		    var option = $(this).find('option:selected');
		    var other = $(this).parents('.select-group-parent').find('.select-group').not($(this));

		    if(option.length==1){
		        other.append(option[0].outerHTML);
		        $(this).find('option:selected').remove();
		        }
		    })
		.on('change', '.other-value', function(){
			if($(this).val() == 'other'){
				$('<input type="text" class="form-control validate" style="margin-top:5px;" />').insertAfter($(this));
				}
			else{
				$(this).siblings().remove();
				}
			})
		.on('change' , '#sort_review_select', function(event){
			event.stopImmediatePropagation();
			Sellyx.ajax.standard({
				url : Sellyx.path.variable() + 'home/reviews',
				data : '&id=' + $(this).data('id') + '&type=' + $(this).val() + ($(this).data('target') ? '&target=' + $(this).data('target') : '' ),
				success : function(data){
					$('.reviews-div').html(data.append);
					}
				})
			})
		.on('click' , '.vote-button', function(event){
			event.stopImmediatePropagation();
			var review  = $(this).parents('.review-box');
			Sellyx.ajax.standard({
				url : Sellyx.path.variable() + 'home/l_vote',
				button : $(this),
				data : '&id=' + $(this).data('id') + '&type=' + $(this).data('vote') + '&review=' +review.data('review') + ($(this).data('target') ? '&target=' + $(this).data('target') : '' ),
				success : function(data){
					review.find('.vote-button[data-vote="2"]').next('span').text(data.up)
					review.find('.vote-button[data-vote="1"]').next('span').text(data.down)
					}
				})
			})
		.on('click' , '.delete-review-button', function(event){
			event.stopImmediatePropagation();
			var review  = $(this).parents('.review-box');
			Sellyx.ajax.standard({
				url : Sellyx.path.variable() + 'home/l_delete_review',
				button : $(this),
				data : '&id=' + $(this).data('id') + '&review=' +review.data('review') + ($(this).data('target') ? '&target=' + $(this).data('target') : '' ),
				success : function(data){
					review.slideUp(300,function(){
						review.remove();
						})
					}
				})
			})
		.on('click' , '.fan-button', function(event){
			event.stopImmediatePropagation();
			var f = $(this).data('fan');
			var id = $(this).data('id');
			var button = $(this);
			if(!f||!id) return false;
			Sellyx.ajax.standard({
				url : Sellyx.path.variable() + 'home/l_fan',
				button : button,
				data : '&id=' + id + '&type=' +f ,
				success : function(data){
					button.text(data.text).data('fan',data.type);
					if(data.type == 2){
						var r = $('.fan-box[data-user="'+data.user+'"]');
						r.slideUp(300,function(){
							r.remove();
							})
						}
					else{
						if($('#fans').find('.fan-box').length > 0) $('#fans .row').append(data.append);
						}
					}
				})
			})
	});

var Sellyx = {
	factory : ( typeof SFactory == 'function' ? SFactory() : null ),
	a : {
		seller : function(obj){
			return '<a href="https://www.sellyx.com/seller/'+obj.id+'">'+obj.name+'</a>';
			},
		user : function(obj){
			return '<a href="https://www.sellyx.com/user/'+obj.id+'">'+obj.name+'</a>';
			}
		},
	validate : function(obj){
		var success = true;
		if(obj instanceof jQuery) var containers = obj;
		else var containers = obj.containers;
		
		var target = obj.target || 'input:text.validate, input:password.validate, textarea.validate, select.validate';
		var message = obj.message || true;


	    containers.find(target).each(function(){
	        if($(this).hasClass('password') && !Sellyx.check.password($(this).val(), true)){
	        	success ? success = false : null;
	        	$(this).addClass('input-error');
	        	}
	        else if($(this).hasClass('email') && !Sellyx.check.email($(this).val(), true)){
	        	success ? success = false : null;
	        	$(this).addClass('input-error');
	        	}
	        else if($(this).is('input, textarea') && $(this).val() == '' ){
	        	success ? success = false : null;
	        	$(this).addClass('input-error');
	            }
	       	else if($(this).is('select') && $(this).hasClass('select2-hidden-accessible') && ($(this).val() == ''||$(this).val()==null||$(this).val()==0) ){
	        	success ? success = false : null;
	        	$(this).next('span').find('.select2-selection').addClass('input-error');
	            }
	        else if($(this).is('select') && !$(this).hasClass('other-value') && ( !$(this).hasClass('not-empty') && ($(this).val() == null || $(this).val() == 0) ) ){
	        	success ? success = false : null;
	        	$(this).addClass('input-error');
	            }  
	        else if($(this).val() == 0){
	        	success ? success = false : null;
	            $(this).addClass('input-error');
	            }
	        });
	    !success && message ? alertify.error('Please fill in all required fields.') : null;
	    return success;
		},
	touch : {
		is : function(){
			return 'ontouchstart' in window // works on most browsers 
    			|| window.navigator.msMaxTouchPoints ; // works on ie10
			}
		},
	helpers : {
		overflown : function(e){
			e = e.get(0);
        	return e.scrollWidth>e.clientWidth;
			}
		},
	trigger : {
		handles : function(div){
			if(Sellyx.touch.is()){
	            $('.sellyx-right, .sellyx-left').hide();
	            $('.sellyx-subpanel-scroll-a').css('overflow-x','auto');
	            }
	        else{
	            $(document).find($('.sellyx-subpanel-scroll-a')).each(function(){
	                var sib = $(this).siblings('.sellyx-right, .sellyx-left');
	                if(Sellyx.helpers.overflown($(this))){
	                    sib.show();
	                    }
	                else{
	                    sib.hide();
	                    }
	                })
	            }
			}
		},
	controls : {
		select : {
			toggle : function(obj){
				// this is for toggling form-controls that have a parent with a target class, and finding their children and toggling them accordingly

				var self = obj.self;
				var go = obj.go;
				var div = (obj.div ? obj.div : self.parents('.form-horizontal'))
				var target = (obj.target ? obj.target : '.type-hide');
				var g = (obj.toggle ? div.find('.form-group') : div.find(target) );


				if($.inArray(self.val(),go) != -1) {
					g.show().find('.form-control').addClass('send');
					g.find('.form-control:not(.nr)').addClass('validate');
					obj.toggle ? div.show() : null;
					}
				else{
					g.hide().find('.form-control').removeClass('send validate input-error');
					obj.toggle ? div.hide() : null;
					}
				},
			input : function(obj){
				var target = obj.target;
				target.next('input').remove();
				if($.inArray(target.val(),obj.go) != -1) {
					$('<input type="text" placeholder="'+(obj.placeholder?obj.placeholder:'')+'" class="form-control validate '+(obj.classes ? obj.classes : '')+' " />').insertAfter(target);
					}
				}
			}
		},
	check : {
		password : function(str, alertShow){
		    var pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,16}$/;
		    var testResult = pattern.test(str);
		    if(!testResult && alertShow){
		        alertify.alert('Please make sure your password satisfies the following conditions: <ul><li>Has at least one uppercase letter</li><li>Has at least one number</li><li>Is at least 7 characters long</li><li>Is less than 16 characters long</li></ul>');
		        }
		    return testResult;
		    },
		email : function(str, alertShow){
			var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
			var testResult = pattern.test(str);
			if(!testResult&&alertShow){
				alertify.error('Not a valid email address');
				}
			return testResult;
			}
		},
	ajax : {
		button : {
			set : function(btn, caption){
		    	btn.text('').append('<div style="text-align:center;"><i class="fa fa-spinner fa-spin" style="width:100%;display:inline-block;"></i><span> ' + caption + '</span></div>');
		    	btn.attr('disabled', true);
		    	},
		    reset : function(btn, caption){
			    btn.children().remove().end().append(caption);
			    btn.attr('disabled', false);
			    }
			},
		process : function(returnData, success , failure){
			if(returnData.success) {
				if(returnData.alert) {
					alertify[returnData.alert](returnData.success);
					}
				if(returnData.reload){
					window.location.reload()
					return;
					}
				success();
				}
			else if(typeof returnData.failure == 'boolean'){
				if(failure) failure();
				}
			else if(returnData.failure.msg && returnData.failure.code == 300){
				alertify.alert(returnData.failure.msg);
				}
			else if(returnData.failure instanceof Object || returnData.failure.data){
				if(returnData.failure.data) {
					var str = '<span>' + returnData.failure.message + '</span><br><br>';
					var check = returnData.failure.data;
					}
				else { 
					var str = '<span>The following fields need to be checked: </span><br><br>';
					var check = returnData.failure;
					}
				
				$.each(check, function(i,o){
					if(returnData.failure.context) var control = $('#' + returnData.failure.context.id).find($('.form-control['+returnData.failure.context.attr+'='+o+']'))
					else var control = $('#' + o);

					if(control.prop('type') == 'checkbox') var text = control.parents('.form-group').find('label').text()
					else var text = control.parents('.form-group').find('.control-label').text()

					if(text.trim() != '') {
						str += '<p style="font-weight:bold;">' + text;
						control.attr('placeholder') != undefined ? str += ' - ' + control.attr('placeholder') + '</p>' : str += '</p>';
						}
					else{
						str += '<p style="font-weight:bold;">' + o + '</p>';
						}
					})
				alertify.alert(str);
				if(failure) failure(returnData.failure)
				}
			else{
				alertify.alert(returnData.failure);
				if(failure) failure(returnData.failure)
				}
			},
		standard : function(obj){
			var go = function(obj){
				var data = (obj.data?obj.data:'');
				var modal = false;

				if(obj.container){
					var g = (obj.container instanceof jQuery ? obj.container : obj.container.divs);
					if(!Sellyx.validate(g)) return false;
					obj.json || obj.container.json ? data += '&send=' : null;
					var j = (obj.container instanceof jQuery ? Sellyx.values.get({divs:obj.container, json:obj.json}) : Sellyx.values.get(obj.container))
					j instanceof Object ? data+=JSON.stringify(j) : data += j

					// let's check and see whether it's a modal - if it is, modal true
					var m = g.find('.modal-content');
					m.length > 0 ? modal = g : null;
					}

				// this is only there if the thing being sent is inside a modal with tabs or other sendable information basically if we have this as set, then we will run the modal changes and blocks on the modal
				if(obj.modal && !modal) modal = obj.modal;

				if(obj.button) var label = obj.button.html();
				$.ajax({
					url : obj.url.search('/') !== -1 ? obj.url : Sellyx.path.ajax() + obj.url,
					data : data,
					type: 'post',
					beforeSend : function(req){
						if(Sellyx.getCookie('sellyxtoken') == null){
							var locationPath = window.location.hash.substr(1);
							window.location.href="https://auth.sellyx.com/login?service=ecommerce&redirection="+locationPath;
						}
						else{
                		req.setRequestHeader('key', Sellyx.getCookie('sellyxtoken').replaceAll('"', ""));
                		req.setRequestHeader('entity', Sellyx.getCookie('entity').replaceAll('"', ""));
                		req.setRequestHeader('currency', Sellyx.getCookie('currency').replaceAll('"', ""));
                		req.setRequestHeader('standard', Sellyx.getCookie('standard').replaceAll('"', ""));
                			}

						if(obj.block){
							var msg = (obj.lang && obj.lang.message ? obj.lang.message : 'Submitting...' );
							if(obj.block instanceof jQuery){
								(obj.block).block({ message : msg });
								}
							else if(obj.block instanceof Object){
								msg = (obj.lang && obj.lang.message?obj.lang.message:( obj.block.message?obj.block.message:'Submitting...' ));
								obj.block.target == 'window' ? $.blockUI({ message : msg }) : (obj.block.target).block({ message : msg});
								}
							else if(obj.block == 'window'){
								$.blockUI({message : msg })
								}
							}
						else if(obj.lang && obj.lang.message){
							if(modal){
								g.block({message:obj.lang.message})
								}
							else if(obj.container instanceof jQuery){
								(obj.container).block({message:obj.lang.message})
								}
							else{
								(obj.container.divs).block({ message : obj.lang.message })
								}
							}
						else{
							obj.button ? Sellyx.ajax.button.set(obj.button,'') : null
							}

						if(obj.before) obj.before()
						}
					})
				.always(function(){
					if(obj.block){
						if(obj.block instanceof jQuery){
							(obj.block).unblock();
							}
						else if(obj.block instanceof Object){
							obj.block.target == 'window' ? $.unblockUI() : (obj.block.target).unblock();
							}
						else if(obj.block == 'window'){
							$.unblockUI()
							}
						}
					else if(obj.lang && obj.lang.message){
						if(modal){
							g.unblock()
							}
						else if(obj.container instanceof jQuery){
							(obj.container).unblock()
							}
						else{
							(obj.container.divs).unblock()
							}
						}
					else{
						obj.button ? Sellyx.ajax.button.reset(obj.button,label) : null
						}
					if(obj.always) obj.always()
					})
				.done(function(returnData){
					Sellyx.ajax.process(returnData, function(){ 
						if(obj.success) obj.success(returnData.success) ; 
						if(modal) {
							obj.erase ? modal[0].innerHTML = '' : Sellyx.reset(modal) ;
							if(!obj.dont_hide) modal.modal('hide');
							}
						if(obj.update) Sellyx.row.update({row:(obj.update.row ? obj.update.row : obj.button.closest('tr')),data:returnData.success, target:(obj.update.target?obj.update.target:false), merge:(obj.update.merge ? obj.update.merge : false), child:(obj.update.child?obj.update.child:false) , table:(obj.update.table?obj.update.table:false) , remove:(obj.update.remove?obj.update.remove:false) })
						if(obj.add) Sellyx.row.add({data:returnData.success,table:obj.add.table});
						if(obj.reload) (obj.reload).DataTable().ajax.reload();
						if(obj.lang && obj.lang.success) alertify.success(obj.lang.success);
						else if(typeof returnData.success == 'string') alertify.success(returnData.success);
						} , (obj.failure?obj.failure:null));
					})
				.fail(function(){
					if(obj.fail) {
						obj.fail()
						return;
						}
					if(obj.failure) obj.failure()
					})
				}

			if(obj.lang && obj.lang.confirm){
				alertify.confirm(obj.lang.confirm, function(e){
					if(e) go(obj);
					})
				}
			else{
				go(obj);
				}
			},
		more : function(obj){
		    var timer = null;
		    var $window = $(window);
		    var $document = $(document);

		    $window
		        .off('scroll', ScrollHandler)
		        .on('scroll', ScrollHandler);

		    function ScrollHandler(e) {
		        clearTimeout(timer);
		        timer = setTimeout(function () {
		            if ($window.scrollTop() + $window.height() > $document.height() - 20) {
		                obj.action();
		                }
		            }, obj.time);
		        }
			}
		},
	getCookie: function(name){
		var re = new RegExp(name + "=([^;]+)");
	    var value = re.exec(document.cookie);
	    return(value!=null)?JSON.parse(JSON.stringify(unescape(value[1]))):null;
	    return (value != null) ? unescape(value[1]) : null;
	},
	reset : function(obj){
		if(obj instanceof jQuery) var containers = obj;
		else var containers = obj.containers;
		containers.find('.form-control:not(.avoid)').each(function(){
			$(this).removeClass('input-error');
			$(this).prop('disabled' , false);
			if($(this).is('input') || $(this).is('textarea') ) $(this).val('').trigger('change')
			else if($(this).is('select') && $(this).prop('multiple') == false) ($(this).val($(this).find('option:first').attr('value')).trigger('change'))
			else if($(this).is('select') && $(this).prop('multiple') == true) ($(this).find('option:selected').prop('selected',false).trigger('change'))
			else if($(this).is('checkbox') || $(this).is('radio')) $(this).prop('checked', false)
			})
		},
	row : {
		data : function(target){
			if(typeof target != 'object') target = $(target);
			try{
				var tId = target.parents('table').attr('id');
				var table = $( '#' + tId).DataTable();	
				var row = (target.parents('.child-row').length > 0 ? target.parents('.child-row').parents('tr').prev('tr') : target.closest('tr') );
			
				return {
					row : row,
					dtrow : table.row(row),
			        tId : tId,
			        table : table,
			        data : table.row(row).data()
			    	}
			    }
			catch(err){
				console.log(err);
				}
			},
		add : function(obj){
			(obj.table).DataTable().row.add(obj.data).draw();
			},
		update : function(obj){
			var row = obj.row;
			var data = (obj.data.data?obj.data.data:obj.data);
			var tId = (obj.table?obj.table:row.parents('table').attr('id'));
			var table = $( '#' + tId).DataTable();
			var merge = (obj.merge ? obj.merge : false);

			console.log(obj)

			if(obj.remove){
				table.row(row).remove().draw();
				return;
				}

			if(obj.child){
				table.row(row).child.hide();
				}
			if(merge){
				data = Sellyx.utility.merge(table.row(row).data(), data)
				}
			if(obj.target){
				var or_data = table.row(row).data();
				or_data[obj.target] = data;
				data = or_data;
				}
			
			table.row(row).data(data).draw();
				
			if(obj.child){
				row.click();
				}
			
			
			},
		remove : function(obj){
			obj.event.stopImmediatePropagation();
	        var info = Sellyx.row.data(obj.button);

	        alertify.confirm(obj.lang.confirm, function(e){
	            if(e){
	                $.ajax({
	                    data: obj.data,
	                    url: obj.url,
	                    type:'post',
	                    beforeSend : function(){
	                        info.row.block({message : obj.lang.message });
	                        }
	                    })
	                .done(function(returnData){
	                    if(returnData.success){
	                        if(obj.reload)	info.table.ajax.reload();
	                        else info.table.row(info.row).remove().draw();
	                        }
	                    else{
	                        alertify.alert(returnData.failure);
	                        }
	                    })
	                .always(function(){
	                    info.row.unblock();
	                    })
	                }
	            });   
			}
		},
	images : {
		colorbox : {
			set : function(obj){
				var small = (obj.small?obj.small:false);
				var randomize = (obj.randomize?Math.floor(Math.random() * 1000000000):'');
				var str = '';
				$.each(obj.data, function(i,img){
					str += '<a href="https://sellyx-ecom.s3-us-west-1.amazonaws.com/l_'+img+'" class="colorbox-productImage'+randomize+'" title="Image '+(i+1)+'">'+(small?'<img src="https://sellyx-ecom.s3-us-west-1.amazonaws.com/s_'+img+'" />':'')+'</a>';
					})
				
				if(obj.remove) $.colorbox.remove();


				if(obj.container){
					(obj.container).children().remove().end().append(str);
	                $('.colorbox-productImage'+randomize).colorbox({rel:'colorbox-productImage'+randomize, transition:"none", width:"75%", height:"75%"});
					}
				else return {str : str , num : randomize};
				},
			activate : function(randomize){
                $('.colorbox-productImage'+randomize).colorbox({rel:'colorbox-productImage'+randomize, transition:"none", width:"75%", height:"75%"});
				}
			},
		remove : function(list, route, file){
			if(file.existing){
				!list['sellyx_deleted_list'] ? list['sellyx_deleted_list'] = [] : null;
				list['sellyx_deleted_list'].push(list[file.name].name);
				}
			else if(file.accepted != false && Object.keys(list).length > 0){
		        $.ajax({
		            url: route + '/removeTempImage',
		            data: '&deleteFile=' + list[file.name].name,
		            type: 'post',
		            });
		        delete list[file.name];
		        }
		    },
		clear : function(obj){
			obj.dz.files = [];
			obj.html.find('.dz-preview').remove();
			},
		set : function(obj){
			var images = obj.images;
			var html = obj.target.html;
			var dz = obj.target.dz;
			var files = (obj.files ? obj.files : window[html[0].id])
			html.find('.dz-preview').remove();
			dz.files = [];
			files = {};

			if(!images) return files;
			$.each(images, function(ind, image_data){
				if(typeof image_data == 'object') image_data = image_data.image;
				var data = {
					name : image_data,
					existing : true,
					accepted : 'true',
					status : 'success',
					size : '0'
					}

				dz.options.addedfile.call(dz, data);
				dz.options.thumbnail.call(dz, data, 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/s_'+image_data+'?AWSAccessKeyId=AKIAIZYV5W77V235JRWQ');
				files[name] = {
					name : 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/s_'+image_data+'?AWSAccessKeyId=AKIAIZYV5W77V235JRWQ',
					existing : true
					};
				dz.files.push(data);
				})
			return files;
			},
		get : function(obj){
			var list = (obj.list ? obj.list : obj);
			var json = (obj.json?obj.json:false);
			var send = {
				new : []
				};

			$.each(list, function(ind, dets){

				if(ind == 'sellyx_deleted_list') {
					send['deleted'] = dets
					}
				else if(!dets.existing){
					send['new'].push(dets.name);
					}
				})
			if(send.new.length > 0 || send.deleted){
				if(json) return send;
				return '&images=' + JSON.stringify(send);
				}
			else{
				if(json) return {};
				return '';
				}
			}
		},
	values : {
		get : function(obj){
			if(obj.validate){
				if(!Sellyx.validate(obj.divs)) return false;
				}

			var divs = (obj instanceof jQuery ? obj : obj.divs);
			var match = obj.match || '.send';
			var json = obj.json ? obj.json : false;
			var retObj = json ? {} : '';
			var attr = obj.html || 'id'
			var partials = {};

			divs.find(match).each(function(i,o){

				if( $(this).is('select') && $(this).hasClass('other-value') && $(this).val() == 'other'){
					var val = $(this).next('input').val();
					// retObj[$(this).attr(attr)] =  '_other_value_' + $(this).next('input').val();
					}
				else if( $(this).is('select') && $(this).hasClass('jsonify') ){
					if($(this).val() == 0) return;
					var val = { value : $(this).val() };
					if($(this).next('input').length > 0) val.extra = $(this).next('input').val();
					!json ? val = JSON.stringify(val) : null;
					}
		        else if($(this).prop('type') == 'checkbox'){
		        	if($(this).is(':checked')) var val = 2 
		        	else var val = 1;
					}
				else{
					var val = $(this).val();
					}

				var i = $(this).attr(attr);
				

				if(i==undefined) return;


				if(i.indexOf('.') != -1){
					var g = i.split('.');
					!partials[g[0]] ? partials[g[0]] = {} : null;
					partials[g[0]][g[1]] = val;
					}
				else if(json) {
					retObj[i] = val;
					}
				else { retObj += '&' + i + '=' + encodeURIComponent(val); }
				})

			if(Object.keys(partials).length > 0){
				if(json){
					return $.extend(retObj,partials);
					}
				else{
					$.each(partials, function(k,vals){
						retObj += '&' + k + '=' + JSON.stringify(vals);
						})
					}
				}

			return retObj;
			},
		set :  function(obj){
			var inputData = obj.data;
			var divs = obj.divs;
			// var addition = (obj.addition ? obj.addition : '');
			var locked = (obj.locked ? obj.locked : false);
			var match = (obj.match ? obj.match : '.send');
			var attr = (obj.html) ? obj.html : 'id';

		    try{
		        divs.find(match).each(function(i,o){

		            $(this).hasClass('input-error') ? $(this).removeClass('input-error') : null;
		            $this = $(this);
		            var editVal;
		            var id = $(this).attr(attr);

		            if(!id){
		            	return;
		            	}
		            else if(id.indexOf('.') !== -1){
		            	var r = id.split('.');
		            	if(!inputData[r[0]]) var tested = '';
		            	else var tested = inputData[r[0]][r[1]];
		            	}
		            else{
		            	var tested = inputData[id];
		            	// var tested = inputData[id.replace(addition, '')];
		         		}

		            if(tested != null && tested != undefined){

		            	if(tested.id && tested.label){
		            		tested = tested.id;
		            		}
		            	else if(tested.data){
		            		tested = tested.data;
		            		}

		            	editVal = decodeURIComponent((tested).toString())

		            	} 
		            else{
		            	editVal = '';
		            	}

		            if($(this).hasClass('select2-container') || $(this).hasClass('select2-offscreen')){
		                }
		            else if($(this).is('select') && $(this).attr('multiple')){
		                $this.find('option').prop('selected', false);
		                var options = editVal.split(',');
		                $.each(options, function(i,o){
		                    if($this.hasClass('select-group')){
		                        var bud = $this.siblings('.select-group');
		                        bud.find('option[value="' + o + '"]').prop('selected', true).trigger('dblclick');
		                        }
		                    else{
		                        $this.find('option[value="' + o + '"]').prop('selected', true);
		                        }
		                    })  
		                }
		            else if($(this).is('select') && $(this).hasClass('other-value')){
		                // first delete all the next boxes
		                $(this).nextAll('input').remove();
		                if($(this).find('option[value="'+editVal+'"]').length == 0){
		                    $(this).val('other').trigger('change');
		                	$(this).next('input').val(editVal)
		                	}
		                else{
		                    $(this).val($(this).find('option:first').attr('value')).trigger('change');
		                	}
		                }
		            else if($(this).is('select') && $(this).hasClass('jsonify')){
		                if(tested && tested.value.id){
		                	$(this).val(tested.value.id).trigger('change');
		                	if(tested.extra) $(this).next('input').val(tested.extra.id);
		                	}
		                else{
		                	$(this).val($(this).find('option:first').attr('value')).trigger('change');
		                	}
		                }
		            else if($(this).is('textarea')){
		                editVal = editVal.replace(/<(?:.|\n)*?>/gm, '');
		                $(this).val(editVal).trigger('keyup');
		                }
		            else if($(this).prop('type') == 'checkbox'){
		                if($(this).hasClass('op')){
		                    editVal == '2' || editVal == 'off' || editVal == '' ? $(this).prop('checked', false) : $(this).prop('checked', true);
		                    }
		                else{
		                    editVal == '1' || editVal == 'off' || editVal == '' ? $(this).prop('checked', false) : $(this).prop('checked', true);
		                    }
		                
		                $(this).trigger('change');
		                }
		            else if($(this).is('input')){
		                editVal = editVal.replace(/<(?:.|\n)*?>/gm, '');
		                $(this).hasClass('data-decimal') || $(this).hasClass('data-number') ? editVal = editVal.replace(/[a-zA-Z ]+/, '') : null;
		                $(this).val(editVal).trigger('focusin').trigger('focusout');
		                }
		            else if($(this).is('select') && $(this).hasClass('ng-valid')){
		                
		                var scope = angular.element($(this)).scope();
		            	scope.$apply(function(o){
					        scope.selectValue = editVal;
					    	});

		            	}
		            else{
		                editVal == '' ? editVal = $(this).find('option:first').attr('value') : null;
		                $(this).val(editVal).trigger('change');
		        	    }

		           	if(typeof locked == 'boolean'){
			            $(this).prop('disabled', locked);
		           		}
		           	else{
		           		if(new RegExp(locked).test(id)){
		           			$(this).prop('disabled',true);
		           			}
		           		else{
		           			$(this).prop('disabled',false);
		           			}
		           		}
		            });
		        }
		    catch(err){
		    	console.log(err);
		        alert(err);
		        }
		    }
		},
	path : {
		ajax : function(){
			return window.location.pathname + '/';
			},
		static : function(){
			return window.location.pathname;
			},
		variable : function(){
			var parts = window.location.pathname.split('/');
			parts.splice(parts.length-1,1);
			return parts.join('/') + '/';
			},
		reload : function(obj){
			if(!obj) window.location.reload()
			},
		redirect : {
			now : function(obj){
				if(obj.path) window.location.assign(obj.path)
				}
			},
		parameters : function(obj){
			if(!obj) var send = {};
			var url = window.location.search.substring(1);
    		var variables = url.split('&');
			for(var i = 0; i < variables.length; i++){
				var param = variables[i].split('=');
				if(obj){
					if (param[0] == obj){
						return param[1];
						}
					}
				else{
					send[param[0]] = param[1];
					}
				}
			if(obj) return false
			else return send;
			},
		reset : function(obj){
			var path = (obj&&obj.path?obj.path:window.location.pathname);
    		window.history.replaceState({},"", path);
			}
		},
	generate : {
		options : function(obj){
			var options = '';
			$.each(obj.data, function(k,v){
				options += '<option value="'+k+'">'+v.name+'</option>';
				})
			return options;
			}
		},
	overflow : function(obj){
		var data = obj.text||obj;
		var extra = obj.extra||false;

		return '<article class="hidden-content">'+data+'</article><a class="toggle-read-more" '+(extra?'data-extra="'+extra+'"':'')+'>Read More '+(extra?' '+extra:'')+'</a>'

		},
	dt : {
		init : function(obj){
			var m = {
				language : {
					search : '',
					loadingRecords : s_lang.tables.loading,
					processing : s_lang.tables.process,
					infoEmpty : s_lang.tables.empty,
					searchPlaceholder : s_lang.tables.search,
					lengthMenu : "_MENU_",
					info : '_START_-_END_ of _TOTAL_ ',
					infoEmpty : 'No results'
					},
				deferRender : true,
				processing : true,
	        	// responsive : true,
				stateDuration : -1,
				stateSave : true,
				// dom : 'TC<"clear">Rlfrtip',
				dom : 'T<"clear">Rlfrtip',
		        // colVis : {
		        //     order : 'alpha'
		        //     }
				}


			if(typeof obj.ajax != 'boolean' ){
				if(obj.ajax instanceof Object){
					if(obj.ajax.path){
						m.ajax = {
							dataSrc : obj.ajax.dataSrc,
							url : Sellyx.path.ajax() + obj.ajax.path
							}
						}
					else{
						m.ajax = obj.ajax;
						}
					}
				else{
					m.ajax = {
			        	url : Sellyx.path.ajax() + obj.ajax
						}
					}

				!m.ajax.dataSrc ? m.ajax.dataSrc = '' : null;
				m.ajax.type = 'POST'
				delete obj.ajax;
				}
			if(obj.parent){
				m.drawCallback = function(settings){
					var api = this.api();
                    var rows = api.rows().nodes();
                    var last = null;
                    var o = api.rows()[0];

                    api.column(obj.parent.target).data().each(function(group,i){
                        if(last == group) return;
                        $(rows).eq(i).before( obj.parent.row(api.row(o[i]).data()));
                        last = group;
                        })
					}
				// delete obj.parent;
				}

			var g = $.extend(m , obj);
			if(g.ajax.data && typeof g.ajax.data != 'function'){
				!g.ajax.data?g.ajax.data={}:null;
				g.ajax.data.y = 1000;
				}

			return g;
			},
		actions : function(obj){
			var str = '<div class="btn-group"> <button onclick="angular.element(this).scope().stopPropagation(event)" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' + (obj.icon ? obj.icon : (obj.id && obj.go ? '<i class="fa fa-fw fa-lg '+($.inArray(obj.id,obj.go) == -1 ? (obj.id && obj.pending && $.inArray(obj.id,obj.pending) !== -1 ? 'fa-calendar s-blue' : 'fa-ban text-danger') : 'fa-check s-green' )+'"></i>' : '') )+obj.status+' <span class="caret"></span> </button> <ul class="dropdown-menu dropdown-menu-right" role="menu">';
			$.each(obj.buttons, function(ind,i){
				i == 'divider' ? str += '<li class="divider"></li>' : str += '<li>' + i + '</li>';
				})
			return str += '</ul></div>';
			},
		order : {
			parent : function(obj){
	            (obj.event).stopImmediatePropagation();
				var cO = (obj.table).DataTable().order()[0];
	            if(cO[0] == obj.target && cO[1] == 'asc'){
	                (obj.table).DataTable().order([obj.target,'desc']).draw();
	                }
	            else{
	                (obj.table).DataTable().order([obj.target,'asc']).draw();
	                }
				}
			},
		child : function(obj){
			var all = obj.all;

			if(all.dtrow.child.isShown()){
                all.dtrow.child.hide();
                all.row.find('.'+(obj.control?obj.control:'child')+'-details-control').addClass('fa-plus-circle').removeClass('fa-minus-circle');
                all.row.removeClass('row-opened');
                }
            else{
                all.row.addClass('row-opened');
                
                var str = '<div class="child-row row" style="padding:10px;">';

                if(obj.table) str += '<table class="child-table table"  '+(obj.table.no_width?'style="width:auto;"':'')+' cellpadding="5" cellspacing="0" border="0"><tbody>' + obj.ins + '</tbody></table>';
                else str += obj.ins

                str += '</div>';

                all.row.find('.'+(obj.control?obj.control:'child')+'-details-control').removeClass('fa-plus-circle').addClass('fa-minus-circle');
                

                all.dtrow.child(str).show();
            	angular.element(all.row.next('tr')).injector().invoke(function($compile) {
	                var c = angular.element(all.row.next('tr'));
	                var scope = c.scope();
	                $compile(c)(scope);
	                })



            	}

            
			}
		},

	dz : {
		ammar: function(obj){
			//var datetime = AWS.util.date.rfc822();
			// console.log(obj.dropzone);
			      return $.extend({
            url : 'http://google.com',
            method : 'POST',
            headers : {
               'key' : Sellyx.getCookie("sellyxtoken").replaceAll('"', '')
            },
            maxFilesize : 6,
            addRemoveLinks : true,
            autoProcessQueue : false,
            uploadMultiple : true,
            parallelUploads: 4,
            maxFiles : 4,
            acceptedFiles : 'image/jpeg, image/bmp, image/gif, image/png',
            accept : function(file,done){
                var fileName = file.name;
                var parent = this.element.id;
                if(window[parent][fileName] === undefined){
                    done();
                    }
                else{
                    done('not happening');
                    alertify.error('You already added this file!');
                    this.removeFile(file);
                    }
                },
            init : function(){
                    // document.getElementById(obj.saveButton).addEventListener("click", function() {
                    //     console.log("hello");
                    // window[obj.dropzone].processQueue(); 
                  // });
              
              this

                    .on('sending' , function(file,xhr,fd){
                        var name = Sellyx.dz.makeId() + ".jpg";
                        window[obj.array].push(name);
                        Sellyx.dz.resizeImg(file,150,150,name);
                        Sellyx.dz.resizeImg(file,400,400,name);
                        Sellyx.dz.resizeImg(file,900,900,name);
                      })
                    this.on("removedfile", function(file) { 
                          // SELLER_IMAGES_NAMES.splice(SELLER_IMAGES_NAMES.indexOf(file.name));
                        });
                
                  }

                }, obj);
		    
			},
		makeId : function()
		{	
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		    for( var i=0; i < 14; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;
		},
		 resizeImg : function(file , max_w, max_h, name){
		      var f = {};
		      if(max_w > 400){
		        f.name = "l_"+name;
		      }
		      else if(max_w >200){
		        f.name = "m_"+name;
		      }
		      else{
		        f.name= "s_"+name;
		      }
		      var reader = new FileReader();
		      reader.onload = function(e) {
		        var img = new Image();
		        img.onload = function() {
		          var w = img.width;
		          var h = img.height;
		          var ratio_w = 1;
		          var ratio_h = 1;
		          if(w > max_w) {
		            ratio_w = max_w / w;
		          }
		          if(h > max_h) {
		            ratio_h = max_h / h;
		          }

		          var ratio = Math.min(ratio_w, ratio_h);
		          w = Math.floor(w * ratio);
		          h = Math.floor(h * ratio);
		          canvas.width = w;
		          canvas.height = h;
		          var ctx = canvas.getContext('2d', {preserveDrawingBuffer: true});
		          ctx.drawImage(img, 0, 0, w, h);

		          var dataURL = canvas.toDataURL('image/jpeg', 0.5);
		          var a = dataURL.split(',')[1];
		          var blob = atob(a);
		          var array = [];
		          for(var k = 0; k < blob.length; k++) {
		            array.push(blob.charCodeAt(k));
		          }
		          var data = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
		          resizeImgList.push(data);
		       
		          var params = {
		                Key: f.name,
		                ContentType: file.type,
		                Body: data,
		                ACL: 'public-read'
		            };
		          bucket.upload(params, function(err, data) {
		                results.innerHTML = err ? 'ERROR!' : 'UPLOADED.';
		            });

		         // $('body').append('<img src="'+URL.createObjectURL(data)+'"></img><br/><br />');
		          // return data;
		        };

		        img.src = e.target.result;
		      }; 
		      reader.readAsDataURL(file);
		  },
		init : function(obj){
			var filelist = [];
			var resizeImgList = [];
			obj = $.extend({} , obj);

			var url = obj.url || Sellyx.path.static();
			delete obj.url;

			return $.extend({
				url : url + '/upload',
				method : 'post',
				maxFilesize : 3,
				addRemoveLinks : true,
				autoProcessQueue : true,
				maxFiles : 6,
				acceptedFiles : 'image/jpeg, image/bmp, image/gif, image/png',
				accept : function(file,done){
					var fileName = file.name;
					var parent = this.element.id;

					if(window[parent][fileName] === undefined){
						done();
						}
					else{
						done('not happening');
						alertify.error('You already added this file!');
						this.removeFile(file);
						}
					},
				init : function(){
					var canvas = document.createElement('canvas');
					var parent = this.element.id;
					this
						.on('success', function(file, response){
							window[parent][file.name] = {name: response.success, existing:false};
					        $('.dz-success').on('click', function(){
					            $(this).addClass('image-primary').siblings().removeClass('image-primary');
					            });
					        })
						.on('removedfile', function(file){
							Sellyx.images.remove(window[parent], url, file);
					        })
					}
				} , obj);
			}
		},
	static : {
		buttons : {
			message : '<button class="btn square-button btn-d-yellow message-user-button" title="Message Seller"><i class="fa fa-envelope"></i></button>'
			}
		},
	utility : {
		object : {
			clone : function(obj){
				return JSON.parse(JSON.stringify(obj));
				},
			values : {
				get : function(obj, path){
					if(path == undefined) {return obj}
					else {
						path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
					    path = path.replace(/^\./, '');           // strip a leading dot
					    var a = path.split('.');
					    while (a.length) {
					        var n = a.shift();
					        if (n in obj) {
					            obj = obj[n];
					        	} 
					        else {
					            return;
					        	}
					    	}

					    return obj;

					    if(truthy !== undefined && truthy) return _s_util.tf(o)
					    else return o;
						}
					},
				}
			},
		merge : function(obj1, obj2){
			var obj3 = {};

			for (var attrname in obj1) { 
				obj3[attrname] = obj1[attrname]; 
				}
			for (var attrname in obj2) { 
				obj3[attrname] = obj2[attrname]; 
				}
			return obj3;
			},
		array :{
			find : {
				object : function(arr, key, value, index, type){
                // type is the key for an embedded object
	                for (var i = 0; i < arr.length; i++) {
	                    var test = (type?arr[i][type][key]:arr[i][key])
	                    if (test == value) {
	                        if(index){
	                            return { object : arr[i] , index : i };
	                            }
	                        else{
	                            return arr[i];
	                            }

	                        }
	                    }
	                return false;
	                },
	            objects : function(arr, key, value, index){
	                var send = [];
	                for (var i = 0; i < arr.length; i++) {
	                    if (arr[i][key] == value) {
	                        if(index){
	                            send.push({ object : arr[i] , index : [i] });
	                            }
	                        else{
	                            send.push(arr[i]);
	                            }
	                        }
	                    }
	                if(send.length > 0) return send;
	                else return false;
	                }
				}
			}
		},
	dtime : {
		datetime : function(obj){
			var target = (obj instanceof jQuery ? obj : obj.target);
			target.datetimepicker({
		        minDate: new Date(),
		        showClear : true,
		        sideBySide : true,
		        keepOpen : true,
		        widgetPositioning : {horizontal : 'auto' , vertical : 'top'},
		        useStrict : true,
		        });
			},
		date : function(){

			}
		},
	vars : {},
	location : {
		currentLocation : function(obj) {
			var address= {};
		    
	      return address;

		}
	}
}


// run general functions here
