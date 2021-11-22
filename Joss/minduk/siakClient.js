var SiakClient = (() => {
	let version=80;
	// const funcMachineId= require('node-machine-id');
	// const funcDns=require('dns');
	// const funcOs=require('os');
	/*start private method and properties*/
	let urlServer = "/";
	// let siaktweak =nw.App.manifest.siaktweak;
	let refWni = {};
	let refWna = {};
	let refActivity = {};
	let refServer={'sekarang':function(){
		let today = new Date();
		let dd = today.getDate();
		let mm = today.getMonth() + 1; //January is 0!

		let yyyy = today.getFullYear();
		if (dd < 10) {
			dd = '0' + dd;
		}
		if (mm < 10) {
			mm = '0' + mm;
		}
		return dd + '-' + mm + '-' + yyyy;
	}};
	let user = { "user_id": "admin", "user_name": "admin", "prop": [], "kab": [], "kec": [], "kel": [] };
	let _initAjax = (element_target) => {
		mUtil.init();
		if ($(element_target).data("top")) {
			mApp.scrollTop();
		}
		initWilayah(element_target);
		initRefWni(element_target);
		initRefWna(element_target);
		initRefActivity(element_target);
		initRefMod(element_target);
		initCariBiodata(element_target);
		initSiakImage(element_target);
	};

	let ajax_ref_wni = () => {
		let href = urlServer + "referensi/wni";
		$.ajax({ url: href, type: 'GET', dataType: "json", cache: false }).done(function (msg) {
			refWni = msg;
		}).fail(function (xhr) {
			$("#modal_gagal_tulisan").html("Proses mengambil referensi dari " + href + " gagal");
			$('#modal_gagal').modal('show');
		});
	};
	let ajax_ref_activity = () => {
		let href = urlServer + "referensi/activity";
		$.ajax({ url: href, type: 'GET', dataType: "json", cache: false }).done(function (msg) {
			refActivity = msg;
		}).fail(function (xhr) {
			$("#modal_gagal_tulisan").html("Proses mengambil referensi dari " + href + " gagal");
			$('#modal_gagal').modal('show');
		});
	};
	let ajax_ref_wna = () => {
		let href = urlServer + "referensi/wna";
		$.ajax({ url: href, type: 'GET', dataType: "json", cache: false }).done(function (msg) {
			refWna = msg;
		}).fail(function (xhr) {
			$("#modal_gagal_tulisan").html("Proses mengambil referensi dari " + href + " gagal");
			$('#modal_gagal').modal('show');
		});
	}
	let ajax_link = (object_html) => {
		let href = $(object_html).attr('href');
		$(object_html).attr('disabled', true);
		SiakClient.loading_block();
		if ($(object_html).data("server")) {
			href = urlServer + href;
			$.ajax({ url: href, type: 'GET', dataType: "json", element_target: object_html, cache: false });
		} else {
			$.ajax({ url: href, type: 'GET', dataType: "html", element_target: object_html });
		}
	};
	let ajax_form = (object_html) => {
		let href = $(object_html).attr('action');
		if ($(object_html).data('action')) {
			href = $(object_html).data('action');
		}
		href = urlServer + href;
		let method = $(object_html).attr('method');
		if ($(object_html).data('method')) {
			method = $(object_html).data('method');
		}
		if (!$(object_html).is("form")) {
			if ($(object_html).is("div")) {
				var param = $('input,select,textarea', object_html).serialize();
			} else {
				var param = $(object_html).serialize();
			}
			$.ajax({ url: href, type: method, element_target: object_html, data: param });
		} else {
			$(object_html).ajaxSubmit({ element_target: object_html });
		}
	};
	let ajax_objek = (object_html) => {
		if (!$(object_html).data('noblock')) {
			SiakClient.loading_block();
		}
		if ($(object_html).data('method')) {
			var method = $(object_html).data('method');
		} else {
			var method = 'POST';
		}
		url = $(object_html).data('url');
		parameter_input = $(object_html).data('parameter');
		var param = '';
		for (var key in parameter_input) {
			if (param == '') {
				if ($('#' + parameter_input[key]).is(":input")) {
					if ($('#' + parameter_input[key]).data("value")) {
						param += encodeURIComponent(key) + '=' + encodeURIComponent($('#' + parameter_input[key]).data("value"));
					} else {
						param += encodeURIComponent(key) + '=' + encodeURIComponent($('#' + parameter_input[key]).val());
					}
				} else {
					param += encodeURIComponent(key) + '=' + encodeURIComponent($('#' + parameter_input[key]).html());
				}
			} else {
				if ($('#' + parameter_input[key]).is(":input")) {
					if ($('#' + parameter_input[key]).data("value")) {
						param += "&" + encodeURIComponent(key) + '=' + encodeURIComponent($('#' + parameter_input[key]).data("value"));
					} else {
						param += "&" + encodeURIComponent(key) + '=' + encodeURIComponent($('#' + parameter_input[key]).val());
					}
				} else {
					param += "&" + encodeURIComponent(key) + '=' + encodeURIComponent($('#' + parameter_input[key]).html());
				}
			}
		}
		if (url) {
			$.ajax({
				type: method,
				url: urlServer + url,
				data: param,
				element_target: object_html
			});
		}
	};
	let json_form = (object_html) => {
		let href = $(object_html).attr('action');
		if ($(object_html).data('action')) {
			href = $(object_html).data('action');
		}
		href = urlServer + href;
		let method = $(object_html).attr('method');
		if ($(object_html).data('method')) {
			method = $(object_html).data('method');
		}
		if (!$(object_html).is("form")) {
			let param = {};
			if ($(object_html).is(":input")) {
				param = $(object_html).serializeJSON();
			} else {
				param = $(object_html).find(":input").serializeJSON();
			}
			$.ajax({ url: href, contentType: "application/json", type: method, element_target: object_html, data: JSON.stringify(param) });
		} else {
			let queryJson = $(object_html).serializeJSON();
			$.ajax({ url: href, contentType: "application/json", type: method, element_target: object_html, data: JSON.stringify(queryJson) });
		}
	};
	let json_objek = (object_html) => {
		if (!$(object_html).data('noblock')) {
			SiakClient.loading_block();
		}
		let method = 'POST';
		if ($(object_html).data('method')) {
			method = $(object_html).data('method');
		}
		url = $(object_html).data('url');
		url = urlServer + url;
		parameter_input = $(object_html).data('parameter');
		let param = {};
		for (var key in parameter_input) {
			let typeData = "auto";
			if ($('#' + parameter_input[key]).data("value-type")) {
				typeData = $('#' + parameter_input[key]).data("value-type");
			}
			if (typeData == "auto") {
				param[key] = $.serializeJSON.parseValue($('#' + parameter_input[key]).val(), null, null, { parseNumbers: true, parseBooleans: true, parseNulls: true });
			} else {
				param[key] = $.serializeJSON.parseValue($('#' + parameter_input[key]).val(), null, typeData, $.serializeJSON.setupOpts());
			}
		}
		$.ajax({
			type: method,
			contentType: "application/json",
			url: url,
			data: JSON.stringify(param),
			element_target: object_html
		});
	};
	let set_form = (object_html, set_json) => {
		//console.log({set_json:set_json});
		if ($(object_html).is('[data-map]')) {
			var map = $(object_html).data('map');
			//console.log({map:map});
			$.each(map, function (object_id, map_json) {
				if (typeof set_json[map_json] != 'undefined') {
					if ($('#' + object_id).length > 0) {
						if (typeof ajaxData[$('#' + object_id).prop('tagName')] == "undefined") {
							ajaxData["default"]($('#' + object_id), set_json[map_json]);
						} else {
							ajaxData[$('#' + object_id).prop('tagName')]($('#' + object_id), set_json[map_json]);
						}
						if ($(object_html).is('[id]')) {
							$('#' + object_id).attr('data-src', $(object_html).attr('id'));
						}
					}
				}
			});
		} else {
			$.each(set_json, function (object_id, nilai) {
				if (typeof ajaxData[$('#' + object_id).prop('tagName')] == "undefined") {
					ajaxData["default"]($('#' + object_id), nilai);
				} else {
					ajaxData[$('#' + object_id).prop('tagName')]($('#' + object_id), nilai);
				}
				if ($(object_html).is('[id]')) {
					$('#' + object_id).attr('data-src', $(object_html).attr('id'));
				}
			});
		}
	};
	let reset_ajax = (object_html) => {
		map = $(object_html).data('map');
		parameter_input = $(object_html).data('parameter');
		for (key in map) {
			if ($('#' + key).data('src') == $(object_html).attr('id')) {
				if ($('#' + key).is('select')) {
					if($("option[value='0']","#"+key).length==0){
						$('#' + key).empty();
						$('#' + key).append($('<option></option>').attr("value", $('#' + key).data('default')[0]).text($('#' + key).data('default')[1]));
					}
					$('#' + key).val('0');
					$('#' + key).removeAttr("data-value");
					$('#' + key).select_readonly(false);

					if ($('#' + key).hasClass("m_selectpicker")) {
						siakSelectpickerHandler($('#' + key));
					}
				}
				else if ($('#' + key).is('input')) {
					$('#' + key).attr('readonly', false);
					$('#' + key).val('');
				}
				else if ($('#' + key).is('img')) {
					$('#' + key).attr('src', base_url + 'assets/img/1.png');
				}
				else {
					$('#' + key).html('');
				}
			}
		}
		if ($(object_html).hasClass('reset_biodata')) {
			if ($(object_html).attr('data-cekniknull')) {
				var cek_nik_nol = $(object_html).data('cekniknull').split('=');
				$('#' + $.trim(cek_nik_nol[0])).val($.trim(cek_nik_nol[1]) + "=0");
			}

			if ($(object_html).attr('data-ortuclass')) {
				$($(object_html).attr('data-ortuclass')).each((i,o) => {
					if ($(o).hasClass('reset_biodata')) {
						$(o).click();
					}
				});
			}

			var keepParameter =(typeof $(object_html).attr('data-keepparam') != 'undefined') ? $(object_html).attr('data-keepparam') : false;
			// console.log({"keepParameter" : keepParameter});
			$(object_html).removeClass('reset_biodata');
			$(object_html).addClass('cari_biodata');

			var i = 0;
			for (key in parameter_input) {
				if (i == 0) {
					if (!keepParameter) {
						if ($('#' + parameter_input[key]).is('select')) {
							$('#' + parameter_input[key]).val('0');
							$('#' + parameter_input[key]).select_readonly(false);
						} else if ($('#' + parameter_input[key]).is(':text')) {
							$('#' + parameter_input[key]).attr('readonly', false);
							if ($('#' + parameter_input[key]).attr('data-default')) {
								$('#' + parameter_input[key]).val($('#' + parameter_input[key]).attr('data-default'));
							} else {
								$('#' + parameter_input[key]).val('');
							}
						}
					}
				}
				i++;
			}
		}
	}
	let selectListWni = (object_html) => {
		let awal = $(object_html).data("default");
		let sect = $(object_html).data("sect");
		$(object_html).append($("<option></option>")
			.attr("value", awal[0])
			.text(awal[1]));
		if (typeof refWni[sect] != "undefined") {
			let data = refWni[sect];
			for (let i = 0; i < data.length; i++) {
				$.each(data[i], function (key, value) {
					$(object_html).append($("<option></option>").attr("value", key).text(key + " - " + value));
				});
			}
		}
	};
	let selectListWna = (object_html) => {
		let awal = $(object_html).data("default");
		let sect = $(object_html).data("sect");
		$(object_html).append($("<option></option>")
			.attr("value", awal[0])
			.text(awal[1]));
		if (typeof refWna[sect] != "undefined") {
			let data = refWna[sect];
			for (let i = 0; i < data.length; i++) {
				$.each(data[i], function (key, value) {
					$(object_html).append($("<option></option>").attr("value", key).text(key + " - " + value));
				});
			}
		}
	};
	let selectListRefAct = (object_html) => {
		let awal = $(object_html).data("default");
		$(object_html).append($("<option></option>")
			.attr("value", awal[0])
			.text(awal[1]));

		if (typeof refActivity != "undefined") {
			let data = refActivity;
			$.each(data, function (key, value) {
				// console.warn({'value' : value, "isObject" : (typeof value == "object"), "isString" : (typeof value == "string")});
				if(typeof value === "string") {
					$(object_html).append($("<option></option>").attr("value", key).text(value));
				}
			});
		}
	};
	let selectListRefMod = (object_html) => {
		let awal = $(object_html).data("default");
		$(object_html).append($("<option></option>")
			.attr("value", awal[0])
			.text(awal[1]));

		if (typeof refActivity != "undefined") {
			let data = refActivity;
			$.each(data, function (key, value) {
				if(typeof value === "object") {
					let content ='<span class="m-badge m-badge--secondary m-badge--wide m-badge--rounded m--font-boldest2 ' + value.class + '">' + value.name + '</span>';
					let str ="<option value=\"" + key + "\" data-content=\"" + $.trim(content.replace(/"/g, "'")) + "\">" + value.name + "</option>";
					let html =$.parseHTML(str);
					$(object_html).append(html);
				}
			});
		}
	};
	let initWilayah = (object_html) => {
		$('.init_wilayah', object_html).each(function (index) {
			let map = $(this).data("map");
			let urlPrefix = $(this).data("url-prefix");
			let keyMap = Object.keys(map);
			let reverseMap = {};
			let that = this;
			for (let keyMap in map) {
				reverseMap[map[keyMap]] = keyMap;
			}
			let defaultWilayah = { "prop": [], "kab": [], "kec": [], "kel": [] };
			let urlSuffix = "getProp";
			if ($(this).data("auth")) {
				Object.keys(defaultWilayah).forEach(function (itm) {
					defaultWilayah[itm] = user[itm].slice(0);
				});
			}
			$.each(map, function (object_id, value) {
				if ($("#" + object_id).is("select")) {
					$("#" + object_id).attr("data-method", 'GET');
					$("#" + object_id).attr("data-noblock", "true");
					if (value == "prop") {
						if (defaultWilayah["prop"].length > 0) {
							$("#" + object_id).attr("data-default", '["' + Object.keys(defaultWilayah["prop"][0])[0] + '","' + defaultWilayah["prop"][0][Object.keys(defaultWilayah["prop"][0])[0]] + '"]');
							urlSuffix = "getKab";
							$(that).attr("data-parameter", '{"NO_PROP":"' + object_id + '"}');
							defaultWilayah[value].shift();
						} else {
							$("#" + object_id).attr("data-default", '["0","==PILIH PROVINSI=="]');
						}
						$("#" + object_id).attr("data-parameter", '{"NO_PROP":"' + object_id + '"}');
						$("#" + object_id).attr("data-url", urlPrefix + "getKab");
						if (reverseMap['kab'] !== undefined) {
							$("#" + object_id).attr("data-map", '{"' + reverseMap['kab'] + '":"kab"}');
						}
					} else if (value == "kab") {
						if (defaultWilayah["kab"].length > 0) {
							$("#" + object_id).attr("data-default", '["' + Object.keys(defaultWilayah["kab"][0])[0] + '","' + defaultWilayah["kab"][0][Object.keys(defaultWilayah["kab"][0])[0]] + '"]');
							urlSuffix = "getKec";
							$(that).attr("data-parameter", '{"NO_PROP":"' + reverseMap['prop'] + '","NO_KAB":"' + object_id + '"}');
							defaultWilayah[value].shift();
						} else {
							$("#" + object_id).attr("data-default", '["0","==PILIH KABUPATEN/KOTA=="]');
						}
						$("#" + object_id).attr("data-parameter", '{"NO_PROP":"' + reverseMap['prop'] + '","NO_KAB":"' + object_id + '"}');
						$("#" + object_id).attr("data-url", urlPrefix + "getKec");
						if (reverseMap['kec'] !== undefined) {
							$("#" + object_id).attr("data-map", '{"' + reverseMap['kec'] + '":"kec"}');
						}
					} else if (value == "kec") {
						if (defaultWilayah["kec"].length > 0) {
							$("#" + object_id).attr("data-default", '["' + Object.keys(defaultWilayah["kec"][0])[0] + '","' + defaultWilayah["kec"][0][Object.keys(defaultWilayah["kec"][0])[0]] + '"]');
							urlSuffix = "getKel";
							$(that).attr("data-parameter", '{"NO_PROP":"' + reverseMap['prop'] + '","NO_KAB":"' + reverseMap['kab'] + '","NO_KEC":"' + object_id + '"}');
							defaultWilayah[value].shift();
						} else {
							$("#" + object_id).attr("data-default", '["0","==PILIH KECAMATAN=="]');
						}
						$("#" + object_id).attr("data-parameter", '{"NO_PROP":"' + reverseMap['prop'] + '","NO_KAB":"' + reverseMap['kab'] + '","NO_KEC":"' + object_id + '"}');
						$("#" + object_id).attr("data-url", urlPrefix + "getKel");
						if (reverseMap['kel'] !== undefined) {
							$("#" + object_id).attr("data-map", '{"' + reverseMap['kel'] + '":"kel"}');
						}
					} else if (value == "kel") {
						if (defaultWilayah["kel"].length > 1) {
							$("#" + object_id).attr("data-default", '["' + Object.keys(defaultWilayah["kel"][0])[0] + '","' + defaultWilayah["kel"][0][Object.keys(defaultWilayah["kel"][0])[0]] + '"]');
							defaultWilayah[value].shift();
							urlSuffix = "";
						} else {
							$("#" + object_id).attr("data-default", '["0","==PILIH DESA/KELURAHAN=="]');
						}
					}
				}
			});
			set_form(this, defaultWilayah);
			if (!$(this).attr("data-url")) {
				$(this).attr("data-url", urlPrefix + urlSuffix);
			}
			$(this).attr("data-method", "GET");
			$(this).attr("data-noblock", "true");
			if (urlSuffix.length > 0) {
				ajax_objek(this);
			}
		});
	};
	let initRefWni = (object_html) => {
		$('select.ref_wni:not(:has(option))', object_html).each(function (index, obj) {
			selectListWni($(obj));
			if ($(obj).hasClass("m_selectpicker")) {
				siakSelectpickerHandler($(obj));
			}
		});
	};
	let initRefWna = (object_html) => {
		$('select.ref_wna:not(:has(option))', object_html).each(function (index, obj) {
			selectListWna($(obj));
			if ($(obj).hasClass("m_selectpicker")) {
				siakSelectpickerHandler($(obj));
			}
		});
	};
	let initRefActivity = (object_html) => {
		$('select.ref_act:not(:has(option))', object_html).each(function (index, obj) {
			selectListRefAct($(obj));
			if ($(obj).hasClass("m_selectpicker")) {
				siakSelectpickerHandler($(obj));
			}
		});
	};
	let initRefMod = (object_html) => {
		$('select.ref_mod:not(:has(option))', object_html).each(function (index, obj) {
			selectListRefMod($(obj));
			if ($(obj).hasClass("m_selectpicker")) {
				siakSelectpickerHandler($(obj));
			}
		});
	};
	let initCariBiodata=(object_html)=>{
		$('button.cari_biodata',object_html).each(function (index){
			if($(this).is('[id]')){
				let map = $(this).data('map');
				let parameter_input = $(this).data('parameter');
				let kosong=false;
				for (key in parameter_input) {
					if($('#' + parameter_input[key]).is("select") || $('#' + parameter_input[key]).is(":text")) {
						// console.log({'key' : parameter_input[key], 'val' : $('#' + parameter_input[key]).val()});
						kosong=$('#' + parameter_input[key]).val().trim()==""||$('#' + parameter_input[key]).val()=="0"||kosong;
					}
				}
				for (key in map) {
					if (kosong) {
						$('#' + map[key]).removeAttr("data-src");
						if($('#' + map[key]).is("select")){
							$('#' + map[key]).select_readonly(false);
							if ($('#' + map[key]).hasClass("m_selectpicker")) {
								siakSelectpickerHandler($('#' + map[key]));
							}
						}else if($('#' + map[key]).is(":text")){
							$('#' + map[key]).attr("readonly",false);
						}
					} else {
						$('#' + map[key]).attr("data-src",$(this).attr("id"));
					}
				}
				if(kosong){
					for (key in parameter_input) {
						$('#' + parameter_input[key]).removeAttr("data-src");
						if($('#' + parameter_input[key]).is("select")){
							$("#" + parameter_input[key]).select_readonly(false);
							if($("#" + parameter_input[key]).hasClass("m_selectpicker")){
								siakSelectpickerHandler($('#' + parameter_input[key]));
							}
						}else if($('#' + parameter_input[key]).is(":text")){
							$('#' + parameter_input[key]).attr("readonly",false);
						}
					}
				}else{
					// $(this).click();
					$(this).removeClass("cari_biodata").addClass("reset_biodata");
				}
			}
		});
	};
	let initSiakImage=(object_html)=>{
		let skr=new Date();
		$("img.siakImage",object_html).on("error",function(e){
			$(this).attr("src","assets/demo/default/media/img/user/"+$(this).data("klmin")+".png");
		});
		$("img.siakImage",object_html).each(function(index){
			if($(this).attr("src").indexOf("siakImage")===0){
				$(this).attr("src",urlServer+$(this).attr("src")+"&_="+skr.getTime());
			}
		});
	};
	let ajaxData = {
		SELECT: function (object_html, data) {
			if ($(object_html).hasClass("ref_wni") && $("option", object_html).length == 0) {
				selectListWni(object_html);
			}
			if ($(object_html).hasClass("ref_wna") && $("option", object_html).length == 0) {
				selectListWna(object_html);
			}
			if (typeof data === 'string' || typeof data === 'number') {
				if ($("option[value!='0']", object_html).length == 0) {
					$(object_html).attr("data-value", data);
					//console.log($(object_html).prop("id")+" "+data);
				} else {
					if ($("option[value='"+data+"']", object_html).length == 0) {
						let awal = $(object_html).data("default");
						$(object_html).val(awal[0]);
					}else{
						$(object_html).val(data);
					}
				}

			} else if (data == null) {
				$(object_html).val('0');
				if ($(object_html).data("default")) {
					let awal = $(object_html).data("default");
					$(object_html).append($("<option></option>")
							.attr("value", awal[0])
							.text(awal[1]));
					$(object_html).val(awal[0]);

				}
			} else {
				//if(data.length>0){
				$(object_html).empty();
				if (typeof data.value != 'undefined') {
					$(object_html)
						.append($("<option></option>")
							.attr("value", data.value)
							.text(data.text));
					$(object_html).val(data.value);
				} else {
					if ($(object_html).data("default")) {
						let awal = $(object_html).data("default");
						$(object_html).append($("<option></option>")
							.attr("value", awal[0])
							.text(awal[1]));
					}
					for (let i = 0; i < data.length; i++) {
						$.each(data[i], function (key, value) {
							if (typeof value == 'string' || typeof value == 'number') {
								let option = $("<option></option>").attr("value", key);
								if ($(object_html).hasClass("dropdown_wilayah") || (!$(object_html).hasClass("ref_wni") && !$(object_html).hasClass("ref_wna") && $(object_html).is("[data-default]"))) {
									option.text(value + " (" + key + ")");
								} else {
									option.text(value);
								}
								$(object_html).append(option);
							} else {
								$(object_html)
									.append($("<option " + value[1] + "></option>")
										.attr("value", key)
										.text(value[0]));
							}
						});
					}
				}
				if ($(object_html).data("value")) {
					if ($("option[value='" + $(object_html).data("value") + "']", object_html).length > 0) {
						$(object_html).val($(object_html).data("value"));
						$(object_html).removeAttr("data-value");
					} else {
						let awal = $(object_html).data("default");
						if (awal) {
							$(object_html).val(awal[0]);
						}
					}
				} else if ($('option[selected]', object_html).length == 0) {
					$(object_html).prop('selectedIndex', 0);
				}
			}
			if ($(object_html).data('valid') ) {
				if ($(object_html).data("default")) {
					let awal = $(object_html).data("default");
					if($(object_html).val()!=awal[0]){
						$(object_html).select_readonly();
					}
				}else{
					$(object_html).select_readonly();
				}
			} else {
				$(object_html).select_readonly(false);
			}

			if ($(object_html).hasClass("m_selectpicker")) {
				siakSelectpickerHandler($(object_html));
			}
		},
		INPUT: function (object_html, data) {
			if (typeof data === 'string' || typeof data === 'number') {
				$(object_html).val(data);
			} else if (data == null) {
				$(object_html).val('');
			}
			if ($(object_html).data('valid')) {
				$(object_html).prop('readonly', true);
			} else {
				$(object_html).prop('readonly', false);
			}
		},
		IMG: function (object_html, data) {
			if (typeof data === 'string' || typeof data === 'number') {
				$(object_html).prop('src', 'data:image/jpeg;base64, ' + data);
			} else if (data == null) {
				$(object_html).html('');
			}
		},
		IFRAME: function(object_html,data){
			if($(object_html).hasClass("pdf_preview")){
				// let urlPdf=encodeURIComponent(urlServer+"siakPrint/cetak/file/getFile?file="+data);
				let urlPdf=encodeURIComponent(urlServer+"siakImage/pdf/print/getFile?file="+data);
				//console.log({urlPdf:urlPdf});
				$(object_html).attr("src","/minduk/plugins/pdfjs/web/preview_cetak.html?file="+urlPdf);
			}else{
				$(object_html).attr("src",data);
			}
		},
		default: function (object_html, data) {
			if (typeof data == 'string' || typeof data == 'number') {
				if ($(object_html).data("function")) {
					if (typeof $(object_html).data("function") == "string") {
						data = listFunction[$(object_html).data("function")](data);
					} else {
						let panggilFungsi = Object.assign([], $(object_html).data("function"));

						let namaFungsi = panggilFungsi.shift();
						panggilFungsi.unshift(data);
						data = listFunction[namaFungsi].apply(null, panggilFungsi);
					}
				}
				$(object_html).html(data);
			} else if (data == null) {
				$(object_html).html('');
			}
		}
	};
	let listClass = {
		form_cari: {
			validasiError(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data("nonDisable")) {
					SiakClient.disable_form(this);
				}
				if ($(this).data("list")) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				if ($(this).data("target")) {
					if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
						//$('#'+$(this).data('target')).data("hasil",xhr.responseText);
						let idTemplate = "listData";
						let href = $(this).attr('action') + ".html";
						let target = $(this).data("target");
						let that = this;
						if ($('#' + $(this).data('target')).data("id-template")) {
							idTemplate = $('#' + $(this).data('target')).data("id-template");
						}
						$('#' + $(this).data('target')).load(href, function () {
							let template = Handlebars.compile($("#" + idTemplate).html());
							let jsonData=JSON.parse(xhr.responseText);
							let html = template(jsonData);
							$('#' + target).append(html);
							if ($(that).data('hidden')) {
								$('#' + $(that).data('target')).show();
								$("#" + $(that).data('hidden')).hide();
							}
							if(typeof jsonData["order"]!="undefined"){
								let orderKolom=jsonData["order"];
								let appendIcon="<i class='la la-arrow-down'></i>";
								let className="sorting_asc";
								if(jsonData["order"].endsWith(" desc")){
									orderKolom=jsonData["order"].substring(0,jsonData["order"].length-5);
									appendIcon="<i class='la la-arrow-up'></i>";
									className="sorting_desc";
								}
								$("th.sorting[data-kolom='"+orderKolom+"']",'#' + target).append(" "+appendIcon);
								$("th.sorting[data-kolom='"+orderKolom+"']",'#' + target).removeClass("sorting").addClass(className);
							}
							if (typeof jsonData.siakExecTime != 'undefined') {
								var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + jsonData['siakExecTime'] + '</abbr></span>&nbsp;ms';
								if ($(e.currentTarget).attr('data-notify-exectime')) {
									var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
									if (typeof content['submod'] != 'undefined') {
										desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
									} else {
										desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
									}
									SiakClient.notifyExecTime(desc, 'success');
								}
								delete jsonData['siakExecTime'];
							}
							$('#' + target).trigger('afterAjaxSuccess');
						});
					} else {
						$('#' + $(this).data('target')).html(xhr.responseText);
						if ($(this).data('hidden')) {
							$('#' + $(this).data('target')).show();
						}
						_initAjax($("#" + $(this).data("target")));
						SiakClient.initUtil($("#" + $(this).data("target")));
					}
				}
			},
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				let template = Handlebars.compile($("#alertError").html());
				let html = "";
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					let jsonHasil = JSON.parse(xhr.responseText);
					var datatpl ={"pesan" : jsonHasil["message"]};
					if (typeof jsonHasil.siakExecTime != 'undefined') {
						datatpl["siakExecTime"] =jsonHasil["siakExecTime"];
						delete jsonHasil['siakExecTime'];
					}

					if (typeof jsonHasil.hasAction != 'undefined') {
						datatpl["hasAction"] =jsonHasil["hasAction"];
						delete jsonHasil['hasAction'];
					}
					html = template(datatpl);
				} else {
					html = template({ "pesan": xhr.responseText });
				}
				$('#' + $(this).data("target")).html(html);
				$('#' + $(this).data("target")).show();
				SiakClient.loading_unblock();
			},
			afterAjaxSuccess(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
			}
		},
		form_login: {
			validasiError(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data("nonDisable")) {
					SiakClient.disable_form(this);
				}
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				window.location.href = urlServer + 'web/menu.html';
				//var win = nw.Window.get();
				//nw.Window.open('menu.html', {}, (new_win) => {
				//	console.log(new_win);
				//	win.close();
				//	new_win.maximize();
				//});
			},
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				let template = Handlebars.compile($("#alertError").html());
				let html = "";
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					let jsonHasil = JSON.parse(xhr.responseText);
					html = template({ "pesan": jsonHasil["message"] });
				} else {
					html = template({ "pesan": xhr.responseText });
				}
				$('#' + $(this).data("target")).html(html);
				$('#' + $(this).data("target")).show();
				SiakClient.loading_unblock();
			},
			afterAjaxSuccess(e) {
				$(this).attr('disabled', false);
			}
		},
		list_data: {
			afterAjaxSuccess(e) {
				e.stopPropagation();
				_initAjax(this);
				SiakClient.initUtil(this);
				SiakClient.loading_unblock();
			}
		},
		ajaxify: {
			konfirmasiOk(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				$(this).trigger('click', true);
			},
			konfirmasiCancel(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
			},
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					var json = $.parseJSON(xhr.responseText);
					if (typeof json.javascript != 'undefined') {
						eval(json.javascript);
					}
					SiakClient.peringatan(json.message);

					if (typeof json.siakExecTime != 'undefined') {
						var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + json['siakExecTime'] + '</abbr></span>&nbsp;ms';
						if ($(e.currentTarget).attr('data-notify-exectime')) {
							var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
							if (typeof content['submod'] != 'undefined') {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							} else {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							}
							SiakClient.notifyExecTime(desc, 'danger');
						}
						delete json['siakExecTime'];
					}
				} else {
					SiakClient.peringatan(xhr.responseText);
				}
				$(this).attr('disabled', false);
				SiakClient.loading_unblock();
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('text/html') >= 0) {
					let hidden = $(this).data('hidden');
					let target = $(this).data('target');
					if (target) {
						$('#' + $(this).data('target')).html(xhr.responseText);
						$('#' + target).show();
					}
					if (hidden) {
						$("#" + hidden).hide();
					}
					_initAjax($("#" + target));
					SiakClient.initUtil($("#" + target));
				} else if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					if ($(this).data("server")) {
						let myURL = new URL("https://dukancil/" + $(this).attr('href'));
						let href = myURL.pathname.substr(1) + ".html";
						let jsonData = JSON.parse(xhr.responseText);
						let target = $(this).data('target');
						let hidden = $(this).data("hidden");
						if(target){
							$('#' + target).load(href, function () {
								$('#' + target).show();
								if (hidden) {
									$("#" + hidden).hide();
								}
								if ($("#" + target).hasClass("view_templ")) {
									let idTemplate = "tabData";
									if ($('#' + target).data("id-template")) {
										idTemplate = $('#' + target).data("id-template");
									}
									let template = Handlebars.compile($("#" + idTemplate, "#" + target).html());
									let html = template(jsonData);
									$('#' + target).append(html);
									_initAjax($('#' + target));
									SiakClient.initUtil($('#' + target));
								} else {
									set_form($('#' + target), jsonData);
									_initAjax($('#' + target));
									SiakClient.initUtil($('#' + target));
								}
								$('#' + target).trigger('afterAjaxSuccess');
							});
						}else{
							SiakClient.sukses(jsonData.message,this);
							if(typeof jsonData.javascript != 'undefined'){
								eval(jsonData.javascript);
							}
						}

						if (typeof jsonData.siakExecTime != 'undefined') {
							var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + jsonData['siakExecTime'] + '</abbr></span>&nbsp;ms';
							if ($(e.currentTarget).attr('data-notify-exectime')) {
								var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
								if (typeof content['submod'] != 'undefined') {
									desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
								} else {
									desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
								}
								SiakClient.notifyExecTime(desc, 'success');
							}
							delete jsonData['siakExecTime'];
						}
					}
				}
			},
			afterAjaxSuccess(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				SiakClient.loading_unblock();
			},
			afterMessageSuccess(e) {
				e.stopPropagation();
				if ($(this).data("refresh")) {
					let refresh = $(this).data("refresh");
					if ($("#" + refresh).is("form")) {
						$("#" + refresh).submit();
					} else {
						$("#" + refresh).click();
					}
				}
			},
			afterMessageError(e) {
				e.stopPropagation();
				SiakClient.loading_unblock();
			}
		},
		view_edit: {
			afterAjaxSuccess(e) {
				e.stopPropagation();
				//_initAjax(this);
			}
		},
		view_templ: {
			afterAjaxSuccess(e) {
				e.stopPropagation();
				//_initAjax(this);
			}
		},
		dropdown_wilayah: {
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					var json = $.parseJSON(xhr.responseText);
					if (typeof json.javascript != 'undefined') {
						eval(json.javascript);
					}
					SiakClient.peringatan(json.message);
				} else {
					SiakClient.peringatan(xhr.responseText);
				}
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					let json = $.parseJSON(xhr.responseText);
					let javascript = '';
					if (typeof json.javascript != 'undefined') {
						javascript = json.javascript;
						delete json['javascript'];
					}
					set_form(this, json);
					if (javascript.length > 0) {
						eval(javascript);
					}
				} else {
					SiakClient.sukses(xhr.responseText, this);
				}
			},
			afterAjaxSuccess(e) {
				e.stopPropagation();
				$(this).select_readonly(false);
			}
		},
		cari_biodata: {
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					var json = $.parseJSON(xhr.responseText);
					if (typeof json.javascript != 'undefined') {
						eval(json.javascript);
					}
					SiakClient.peringatan(json.message);
					if (typeof json.siakExecTime != 'undefined') {
						var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + json['siakExecTime'] + '</abbr></span>&nbsp;ms';
						if ($(e.currentTarget).attr('data-notify-exectime')) {
							var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
							if (typeof content['submod'] != 'undefined') {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							} else {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							}
						}
						delete json['siakExecTime'];
						SiakClient.notifyExecTime(desc, 'danger');
					}
				} else {
					SiakClient.peringatan(xhr.responseText);
				}
				$(this).attr('disabled', false);
				SiakClient.loading_unblock();
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					let json = $.parseJSON(xhr.responseText);
					let javascript = '';
					if (typeof json.javascript != 'undefined') {
						javascript = json.javascript;
						delete json['javascript'];
					}
					set_form(this, json);
					if (javascript.length > 0) {
						eval(javascript);
					}
					if (typeof json.siakExecTime != 'undefined') {
						var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + json['siakExecTime'] + '</abbr></span>&nbsp;ms';
						if ($(e.currentTarget).attr('data-notify-exectime')) {
							var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
							if (typeof content['submod'] != 'undefined') {
								desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							} else {
								desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							}
						}
						delete json['siakExecTime'];
						SiakClient.notifyExecTime(desc, 'success');
					}
				} else {
					SiakClient.sukses(xhr.responseText, this);
				}
			},
			afterAjaxSuccess(e) {
				e.stopPropagation();
				$(this).removeClass('cari_biodata').addClass('reset_biodata');
				SiakClient.loading_unblock();
				$(this).attr('disabled', false);
			}
		},
		init_wilayah: {
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					var json = $.parseJSON(xhr.responseText);
					if (typeof json.javascript != 'undefined') {
						eval(json.javascript);
					}
					SiakClient.peringatan(json.message);
				} else {
					SiakClient.peringatan(xhr.responseText);
				}
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					let json = $.parseJSON(xhr.responseText);
					let javascript = '';
					if (typeof json.javascript != 'undefined') {
						javascript = json.javascript;
						delete json['javascript'];
					}
					set_form(this, json);
					if (javascript.length > 0) {
						eval(javascript);
					}
				} else {
					SiakClient.sukses(xhr.responseText, this);
				}
			},
			afterAjaxSuccess(e) {
				e.stopPropagation();
				let map = $(this).data('map');
				for (key in map) {
					if ($('#' + key).data("value")) {
						$("#" + key).removeData("value");
						$("#" + key).removeAttr("data-value");
					}
				}
				$(this).removeClass("init_wilayah");
			}
		},
		form_input: {
			validasiError(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data('nonDisable')) {
					SiakClient.disable_form(this);
				}
				if ($(this).data('list')) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
			},
			konfirmasiOk(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				$(this).trigger('submit', true);
			},
			konfirmasiCancel(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data('nonDisable')) {
					SiakClient.disable_form(this);
				}
				if ($(this).data('list')) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
			},
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data('nonDisable')) {
					SiakClient.disable_form(this);
				}
				if ($(this).data('list')) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
				if (xhr.getResponseHeader("content-type") && xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					let json = $.parseJSON(xhr.responseText);
					if (typeof json.javascript != 'undefined') {
						eval(json.javascript);
					}
					SiakClient.peringatan(json.message, this);
					if (typeof json.siakExecTime != 'undefined') {
						var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + json['siakExecTime'] + '</abbr></span>&nbsp;ms';
						if ($(e.currentTarget).attr('data-notify-exectime')) {
							var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
							if (typeof content['submod'] != 'undefined') {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							} else {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							}
							SiakClient.notifyExecTime(desc, 'danger');
						}
						delete json['siakExecTime'];
					}
				} else {
					SiakClient.peringatan(xhr.responseText, this);
				}
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				if ($(this).data('target')) {
					if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
						if ($(this).data("server")) {
							let myURL = new URL("https://dukancil/" + $(this).attr('action'));
							let href = myURL.pathname.substr(1) + ".html";
							let jsonData = JSON.parse(xhr.responseText);
							let target = $(this).data('target');
							let hidden = $(this).data("hidden");
							$('#' + target).load(href, function () {
								$('#' + target).show();
								if (hidden) {
									$("#" + hidden).hide();
								}
								if ($("#" + target).hasClass("view_templ")) {
									let idTemplate = "tabData";
									if ($('#' + target).data("id-template")) {
										idTemplate = $('#' + target).data("id-template");
									}
									let template = Handlebars.compile($("#" + idTemplate, "#" + target).html());
									let html = template(jsonData);
									$('#' + target).append(html);
								} else {
									set_form($('#' + target), jsonData);
								}

								if (typeof jsonData.siakExecTime != 'undefined') {
									var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + jsonData['siakExecTime'] + '</abbr></span>&nbsp;ms';
									if ($(e.currentTarget).attr('data-notify-exectime')) {
										var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
										if (typeof content['submod'] != 'undefined') {
											desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
										} else {
											desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
										}
										SiakClient.notifyExecTime(desc, 'success');
									}
									delete jsonData['siakExecTime'];
								}
								$('#' + target).trigger('afterAjaxSuccess');
							});
						}
					} else if (xhr.getResponseHeader("content-type").indexOf('text/html') >= 0) {
						$('#' + $(this).data('target')).html(xhr.responseText);
						if ($(this).data('hidden')) {
							$('#' + $(this).data('target')).show();
						}
						_initAjax($('#' + $(this).data('target')));
						SiakClient.initUtil($('#' + $(this).data('target')));
					}
				} else {
					if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
						var json = $.parseJSON(xhr.responseText);
						if (typeof json.javascript != 'undefined') {
							eval(json.javascript);
							delete json['javascript'];
						}
						if (typeof json.message != 'undefined') {
							SiakClient.sukses(json.message, this);
							delete json['message'];
						}
						if (typeof json.siakExecTime != 'undefined') {
							var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + json['siakExecTime'] + '</abbr></span>&nbsp;ms';
							if ($(e.currentTarget).attr('data-notify-exectime')) {
								var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
								if (typeof content['submod'] != 'undefined') {
									desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
								} else {
									desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
								}
								SiakClient.notifyExecTime(desc, 'success');
							}
							delete json['siakExecTime'];
						}
						set_form(this,json);
					} else {
						SiakClient.sukses(xhr.responseText, this);
					}
					$('input[type="submit"], button[type="submit"]', this).attr('disabled', true);
				}
			},
			afterAjaxSuccess(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data('nonDisable')) {
					SiakClient.disable_form(this);
				}
				if ($(this).data('list')) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
				SiakClient.loading_unblock();
			},
			afterMessageSuccess(e) {
				e.stopPropagation();
				if ($(this).data("refresh")) {
					let refresh = $(this).data("refresh");
					if ($("#" + refresh).is("form")) {
						$("#" + refresh).submit();
					} else {
						$("#" + refresh).click();
					}
				}
			},
			afterMessageError(e) {
				e.stopPropagation();
				SiakClient.loading_unblock();
			}
		},
		form_default: {
			validasiError(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data('nonDisable')) {
					SiakClient.disable_form(this);
				}
				if ($(this).data('list')) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
			},
			ajaxErrorElement(e, xhr) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data('nonDisable')) {
					SiakClient.disable_form(this);
				}
				if ($(this).data('list')) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
				if (xhr.getResponseHeader("content-type") && xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
					let json = $.parseJSON(xhr.responseText);
					if (typeof json.javascript != 'undefined') {
						eval(json.javascript);
					}
					SiakClient.peringatan(json.message, this);
					if (typeof json.siakExecTime != 'undefined') {
						var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + json['siakExecTime'] + '</abbr></span>&nbsp;ms';
						if ($(e.currentTarget).attr('data-notify-exectime')) {
							var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
							if (typeof content['submod'] != 'undefined') {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							} else {
								desc ="<span class=\"m-badge m-badge--danger m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
							}
							SiakClient.notifyExecTime(desc, 'danger');
						}
						delete json['siakExecTime'];
					}
				} else {
					SiakClient.peringatan(xhr.responseText, this);
				}
			},
			ajaxSuccessElement(e, xhr) {
				e.stopPropagation();
				if ($(this).data('target')) {
					if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
						if ($(this).data("server")) {
							let myURL = new URL("https://dukancil/" + $(this).attr('action'));
							let href = myURL.pathname.substr(1) + ".html";
							let jsonData = JSON.parse(xhr.responseText);
							let target = $(this).data('target');
							let hidden = $(this).data("hidden");
							$('#' + target).load(href, function () {
								$('#' + target).show();
								if (hidden) {
									$("#" + hidden).hide();
								}
								if ($("#" + target).hasClass("view_templ")) {
									let idTemplate = "tabData";
									if ($('#' + target).data("id-template")) {
										idTemplate = $('#' + target).data("id-template");
									}
									let template = Handlebars.compile($("#" + idTemplate, "#" + target).html());
									let html = template(jsonData);
									$('#' + target).append(html);
								} else {
									set_form($('#' + target), jsonData);
								}

								if (typeof jsonData.siakExecTime != 'undefined') {
									var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + jsonData['siakExecTime'] + '</abbr></span>&nbsp;ms';
									if ($(e.currentTarget).attr('data-notify-exectime')) {
										var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
										if (typeof content['submod'] != 'undefined') {
											desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
										} else {
											desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
										}
										SiakClient.notifyExecTime(desc, 'success');
									}
									delete jsonData['siakExecTime'];
								}
								$('#' + target).trigger('afterAjaxSuccess');
							});
						}
					} else if (xhr.getResponseHeader("content-type").indexOf('text/html') >= 0) {
						$('#' + $(this).data('target')).html(xhr.responseText);
						if ($(this).data('hidden')) {
							$('#' + $(this).data('target')).show();
						}
						_initAjax($('#' + $(this).data('target')));
						SiakClient.initUtil($('#' + $(this).data('target')));
					}
				} else {
					if (xhr.getResponseHeader("content-type").indexOf('application/json') >= 0) {
						var json = $.parseJSON(xhr.responseText);
						if (typeof json.javascript != 'undefined') {
							eval(json.javascript);
						}
						if (typeof json.message != 'undefined') {
							SiakClient.sukses(json.message, this);
							delete json['message'];
						}

						if (typeof json.siakExecTime != 'undefined') {
							var desc ='<span class="m--font-warning m--font-bolder"><abbr title="Execution Time SIAK (in Millisecond)">' + json['siakExecTime'] + '</abbr></span>&nbsp;ms';
							if ($(e.currentTarget).attr('data-notify-exectime')) {
								var content =$.parseJSON($(e.currentTarget).attr('data-notify-exectime'));
								if (typeof content['submod'] != 'undefined') {
									desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<b>" + content['submod'] + "</b>&nbsp;<u>" + content['act'] + "</u> : " + desc;
								} else {
									desc ="<span class=\"m-badge m-badge--success m-badge--wide m--font-bold\">" + content['mod'] + "</span>&nbsp;<u>" + content['act'] + "</u> : " + desc;
								}
								SiakClient.notifyExecTime(desc, 'success');
							}
							delete json['siakExecTime'];
						}
						set_form(this,json);
					} else {
						SiakClient.sukses(xhr.responseText, this);
					}
					$('input[type="submit"], button[type="submit"]', this).attr('disabled', true);
				}
			},
			afterAjaxSuccess(e) {
				e.stopPropagation();
				$(this).attr('disabled', false);
				if (!$(this).data('nonDisable')) {
					SiakClient.disable_form(this);
				}
				if ($(this).data('list')) {
					$('#' + $(this).data('list')).unwrap("#frm_cetak");
				}
				SiakClient.loading_unblock();
			},
			afterMessageSuccess(e) {
				e.stopPropagation();
				if ($(this).data("refresh")) {
					let refresh = $(this).data("refresh");
					if ($("#" + refresh).is("form")) {
						$("#" + refresh).submit();
					} else {
						$("#" + refresh).click();
					}
				}
			},
			afterMessageError(e) {
				e.stopPropagation();
				SiakClient.loading_unblock();
			}
		}
	};
	let listFunction = {
		stripEmpty: (data) => {
			let hasil;
			if (data.trim().length == 0) {
				return "-";
			}
			return data;
		},
		camelCaseToDash: (str) => {
			return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
		},
		pad: (n, width, z) => {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		},
		formatDate: (datetime, format, fromFormat) => {
			if (datetime.trim().length == 0) {
				return datetime
			}
			if (typeof fromFormat != "string" && typeof fromFormat != "number") {
				fromFormat = "YYYY-MM-DDTHH:mm:ssZ";

			}
			if (moment) {
				if(fromFormat.includes("Z")){
					return moment(datetime, fromFormat).utcOffset(7).format(format);
				}else{
					return moment(datetime, fromFormat).format(format);
				}
			} else {
				return datetime;
			}
		},
		refWni: (kode, sect) => {
			if (typeof refWni[sect] != "undefined") {
				let filteredArray = refWni[sect].filter(function (itm) {
					return itm.hasOwnProperty(kode);
				});
				if (filteredArray.length == 1) {
					return filteredArray[0][kode];
				}
			}
			return '0';
		},
		refAction: (kode) => {
			let hasil = "";
			if (typeof refActivity[kode] != "undefined") {
				hasil = '<span class="m-badge m-badge--secondary m-badge--wide m-badge--rounded m--font-boldest2 ' + refActivity[kode]["class"] + '">' + refActivity[kode]["name"] + '</span>';
				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(hasil);
					}
				}
			}
			return hasil;
		},
		refMod: (kode) => {
			let hasil = "";
			if (typeof refActivity[kode] != "undefined") {
				hasil = refActivity[kode];
			}
			return hasil;
		},
		refWna: (kode, sect) => {
			let hasil = "";
			if (typeof refWna[sect] != "undefined") {
				let filteredArray = refWna[sect].filter(function (itm) {
					return itm.hasOwnProperty(kode);
				});
				if (filteredArray.length == 1) {
					return filteredArray[0][kode];
				}
			}
			return '0';
		},
		bsreInfo : (_stat) => {
			let _info ="";
			if (_stat != null || _stat != '') {
				switch (parseInt(_stat)) {
					case 9:
						_info = "Pengajuan";
						break;
					case 91:
						_info = "Pengajuan dibatalkan";
						break;
					case 92:
						_info = "Pengajuan ditolak";
						break;
					case 1:
						_info = "Ter-verifikasi";
						break;
					case 11:
						_info = "Verifikasi dibatalkan";
						break;
					case 12:
						_info = "Verifikasi ditolak";
						break;
					case 3:
						_info = "Menunggu Sertifikasi";
						break;
					case 4:
						_info = "Sudah TTD Elektronik";
						break;
					default:
						_info = "";
						break;
				}
			}
			return _info;
		},
		bsreLabel : (_stat) => {
			let _label = "";
			if (_stat != null || _stat != '') {
				switch (parseInt(_stat)) {
					case 9:
						_label = "<span class=\"bsre-label m-badge m-badge--accent m-badge--wide\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-tte=\"" + _stat + "\">" + listFunction.bsreInfo(_stat) + "<\/span>";
						break;
					case 91:
						_label = "<span class=\"bsre-label m-badge bg-color_marun m-badge--wide\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-tte=\"" + _stat + "\">" + listFunction.bsreInfo(_stat) + "<\/span>";
						break;
					case 92:
						_label = "<span class=\"bsre-label m-badge bg-color_marun m-badge--wide\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-tte=\"" + _stat + "\">" + listFunction.bsreInfo(_stat) + "<\/span>";
						break;
					case 1:
						_label = "<span class=\"bsre-label m-badge bg-color_ungu m-badge--wide\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-tte=\"" + _stat + "\">" + listFunction.bsreInfo(_stat) + "<\/span>";
						break;
					case 11:
						_label = "<span class=\"bsre-label m-badge bg-color_marun m-badge--wide\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-tte=\"" + _stat + "\">" + listFunction.bsreInfo(_stat) + "<\/span>";
						break;
					case 12:
						_label = "<span class=\"bsre-label m-badge bg-color_marun m-badge--wide\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-tte=\"" + _stat + "\">" + listFunction.bsreInfo(_stat) + "<\/span>";
						break;
					case 3:
						_label = "<span class=\"bsre-label m-badge bg-color_tosca m-badge--wide\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-tte=\"" + _stat + "\">" + listFunction.bsreInfo(_stat) + "<\/span>";
						break;

					default:
						_label = "";
						break;
				}
				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		bioFlagPindah : (_stat, _prefix) => {
			let _info ="";
			if (_stat != null || _stat != '') {
				switch (_stat) {
					case '1':
						_info = "Dalam satu Desa/Kelurahan";
						break;
					case '2':
						_info = "Antar Desa/Kelurahan";
						break;
					case '3':
						_info = "Antar Kecamatan";
						break;
					case '4':
						_info = "Antar Kabupaten/Kota";
						break;
					case '5':
						_info = "Antar Provinsi";
						break;
					case '6':
						_info = "Ke Luar Negeri";
						break;
					case '9':
						_info = "Kepala Keluarga Flag Status Mati";
						break;
					default:
						_info = "";
						break;
				}
			}
			return _info;
		},
		bioFlagPindahIconLabel : (_stat) => {
			let _label ="";
			if (_stat != null || _stat != '') {
				switch (_stat) {
					case '1':
						_label = "<span style=\"vertical-align: middle;\"><i class=\"flaticon-truck m--font-accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\"></i></span>";
						break;
					case '2':
						_label = "<span style=\"vertical-align: middle;\"><i class=\"flaticon-truck m--font-accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\"></i></span>";
						break;
					case '3':
						_label = "<span style=\"vertical-align: middle;\"><i class=\"flaticon-truck m--font-accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\"></i></span>";
						break;
					case '4':
						_label = "<span style=\"vertical-align: middle;\"><i class=\"flaticon-truck m--font-accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\"></i></span>";
						break;
					case '5':
						_label = "<span style=\"vertical-align: middle;\"><i class=\"flaticon-truck m--font-accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\"></i></span>";
						break;
					case '6':
						_label = "<span style=\"vertical-align: middle;\"><i class=\"flaticon-truck m--font-accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\"></i></span>";
						break;
					case '9':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--warning\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\">&nbsp;&nbsp;<\/span>";
						// _label = "<span style=\"vertical-align: middle;\"><i class=\"flaticon-truck\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\"></i></span>";
						break;
					default:
						_info = "";
						break;
				}
			}
			return _label;
		},
		kkFlagPindahIconLabel : (_stat) => {
			let _label ="";
			if (_stat != null || _stat != '') {
				switch (_stat) {
					case '1':
						_label = "<span class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"Kepala Keluarga dalam proses pindah\" data-original-title=\"Kepala Keluarga dalam proses pindah\">&nbsp;&nbsp;<\/span>";
						_label+= "&nbsp;&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat);
						break;
					case '2':
						_label = "<span class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"Kepala Keluarga dalam proses pindah\" data-original-title=\"Kepala Keluarga dalam proses pindah\">&nbsp;&nbsp;<\/span>";
						_label+= "&nbsp;&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat);
						break;
					case '3':
						_label = "<span class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"Kepala Keluarga dalam proses pindah\" data-original-title=\"Kepala Keluarga dalam proses pindah\">&nbsp;&nbsp;<\/span>";
						_label+= "&nbsp;&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat);
						break;
					case '4':
						_label = "<span class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"Kepala Keluarga dalam proses pindah\" data-original-title=\"Kepala Keluarga dalam proses pindah\">&nbsp;&nbsp;<\/span>";
						_label+= "&nbsp;&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat);
						break;
					case '5':
						_label = "<span class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"Kepala Keluarga dalam proses pindah\" data-original-title=\"Kepala Keluarga dalam proses pindah\">&nbsp;&nbsp;<\/span>";
						_label+= "&nbsp;&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat);
						break;
					case '6':
						_label = "<span class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"Kepala Keluarga dalam proses pindah\" data-original-title=\"Kepala Keluarga dalam proses pindah\">&nbsp;&nbsp;<\/span>";
						_label+= "&nbsp;&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat);
						break;
					case '9':
						_label = listFunction.bioFlagPindahIconLabel(_stat);
						// _label = "<span class=\"m-badge m-badge--warning\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagPindah(_stat) + "\" data-original-title=\"" + listFunction.bioFlagPindah(_stat) + "\">&nbsp;&nbsp;<\/span>";
						break;
					default:
						_info = "";
						break;
				}
			}
			return _label;
		},
		bioFlagStatus : (_stat) => {
			let _info ="";
			if (_stat != null || _stat != '') {
				switch (_stat) {
					case '0':
						_info = "";
					case '1':
						_info = "Status Biodata Mati";
						break;
					case '2':
						_info = "Biodata dalam proses pindah";
						break;
					case '3':
						_info = "Pindah ke luar negeri";
						break;
					case '4':
						_info = "Duplicate/Indikasi Ganda";
						break;
					case '5':
						_info = "Berada di luar negeri";
						break;
					case '7':
						_info = "WNI menjadi OA";
						break;
					case '8':
						_info = "Telah datang di tujuan";
						break;
					case '9':
						_info = "Pembuatan Akta Kelahiran belum dilanjutkan";
						break;
					case 'L':
						_info = "Anomali";
						break;
					case 'K':
						_info = "Tidak Aktif";
						break;
					default:
						_info = "Status Tidak Diketahui";
						break;
				}
			}
			return _info;
		},
		bioFlagStatusIconLabel : (_stat, _stat_pindah) => {
			let _label = "";
			if (_stat != null || _stat != '') {
				switch (_stat) {
					case '0':
						_label = "";
						break;
					case '1':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--danger\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case '2':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						if (typeof _stat_pindah !== 'undefined') {
							if (_stat_pindah != null || _stat_pindah != '') {
								// _label = "<span class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + " (" + listFunction.bioFlagPindah(_stat_pindah) + ")\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + " (" + listFunction.bioFlagPindah(_stat_pindah) + ")\">" + _stat + "<\/span>";
								// _label += "&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat_pindah);
								if (_stat_pindah != '9') {
									_label += "&nbsp;&nbsp;" + listFunction.bioFlagPindahIconLabel(_stat_pindah);
								} else {
									_label = listFunction.bioFlagPindahIconLabel(_stat_pindah);
								}
							}
						}
						break;
					case '3':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case '4':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--danger\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case '5':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case '7':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--brand\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case '8':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--accent\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case '9':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--warning\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case 'L':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--danger\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					case 'K':
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--metal\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">" + _stat + "<\/span>";
						break;
					default:
						_label = "<span style=\"cursor:default\" class=\"m-badge m-badge--metal\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-title=\"" + listFunction.bioFlagStatus(_stat) + "\" data-original-title=\"" + listFunction.bioFlagStatus(_stat) + "\">&nbsp;&nbsp;<\/span>";
						break;
				}
				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		bioWargaNegaraLabel : (_tipe, _dok_imgr) => {
			let _label = "";
			if (_tipe != null || _tipe != '') {
				switch (parseInt(_tipe)) {
					case 1:
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #1ba39c!important; color: #fff!important\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">Biodata WNI</span>";
						break;
					case 2:
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #5e738b!important; color: #fff!important\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">Biodata OA</span>";
						if (typeof _dok_imgr !== 'undefined') {
							if (_dok_imgr != null || _dok_imgr != '') {
								_label += "&nbsp;&nbsp;" + listFunction.oaImigrasiLabel(_dok_imgr);
							}
						}
						break;
					default:
						_label = "";
						break;
				}
				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		oaImigrasiLabel : (_dok_imgr) => {
			let _label = "";
			if (_dok_imgr != null || _dok_imgr != '') {
				switch (parseInt(_dok_imgr)) {
					case 1:
						_label = "<span class=\"m-badge m-badge--wide\" style=\"border: 1px solid #5e738b!important\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">KITAS</span>";
						break;
					case 2:
						_label = "<span class=\"m-badge m-badge--wide\" style=\"border: 1px solid #d05454!important\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">KITAP</span>";
						break;
					default:
						_label = "";
						break;
				}
				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		kkTipeLabel : (_tipe) => {
			let _label = "";
			if (_tipe != null || _tipe != '') {
				switch (parseInt(_tipe)) {
					case 2:
						_label = "<span class=\"m-badge m-badge--metal m-badge--wide m-badge--rounded m--font-boldest\" style=\"background-color: #4c87b9 !important\">KITAP</span>";
						break;
					case 3:
						_label = "<span class=\"m-badge m-badge--metal m-badge--wide m-badge--rounded m--font-boldest\" style=\"background-color: #c5bf66 !important\">KITAS</span>";
						break;
					default:
						_label = "";
						break;
				}
				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		userGroupLevel : (_level) => {
			let _deskripsi ="";
			if (_level != null || _level != '') {
				switch (_level) {
					case '0':
						_deskripsi = "PUSAT";
						break;
					case '1':
						_deskripsi = "BEBERAPA PROVINSI";
						break;
					case '2':
						_deskripsi = "PROVINSI";
						break;
					case '3':
						_deskripsi = "BEBERAPA KABUPATEN/KOTA";
						break;
					case '4':
						_deskripsi = "KABUPATEN/KOTA";
						break;
					case '5':
						_deskripsi = "BEBERAPA KECAMATAN";
						break;
					case '6':
						_deskripsi = "KECAMATAN";
						break;
					case '7':
						_deskripsi = "BEBERAPA KELURAHAN/DESA";
						break;
					case '8':
						_deskripsi = "KELURAHAN/DESA";
						break;
					case '9':
						_deskripsi = "LINTAS INSTANSI";
						break;
					case 'A':
						_deskripsi = "LUAR NEGERI";
						break;
					default:
						_deskripsi = "";
						break;
				}
			}
			return _deskripsi;
		},
		userGroupLevelLabel : (_level) => {
			let _label ="";
			if (_level != null || _level != '') {
				switch (_level) {
					case '0':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #525e64!important; color: #fff!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '1':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #e1e5ec!important; color: #4b77be!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '2':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #4b77be!important; color: #fff!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '3':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #e1e5ec!important; color: #1ba39c!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '4':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #1ba39c!important; color: #fff!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '5':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #e1e5ec!important; color: #fd7e14!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '6':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #fd7e14!important; color: #fff!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '7':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #e1e5ec!important; color: #9a12b3!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '8':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #9a12b3!important; color: #fff!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case '9':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #ff99ee!important; color: #fff!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					case 'A':
						_label = "<span class=\"m-badge m-badge--wide\" style=\"background: #e1e5ec!important; color: #525e64!important; font-weight:600;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\">" + listFunction.userGroupLevel(_level) + "</span>";
						break;
					default:
						_label = "";
						break;
				}

				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		statusAktifLabel : (_stat, _isLong) => {
			let _label ="";
			var _isLong =(typeof _isLong != 'undefined' || (_isLong != null || _isLong != '')) ? true : false;
			if (_stat != null || _stat != '') {
				switch (_stat) {
					case 0:
						_label = "<span class=\"m-badge m-badge--danger\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak Aktif\">&nbsp;</span>";
						if (_isLong) {
							_label = "<span class=\"m-badge m-badge--danger m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak Aktif\"> INACTIVE </span>";
						}
						break;
					case 1:
						_label = "<span class=\"m-badge m-badge--success\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Aktif\">&nbsp;</span>";
						if (_isLong) {
							_label = "<span class=\"m-badge m-badge--success m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Aktif\"> &nbsp;&nbsp;ACTIVE&nbsp;&nbsp; </span>";
						}
						break;
					case '0':
						_label = "<span class=\"m-badge m-badge--danger\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak Aktif\">&nbsp;</span>";
						if (_isLong) {
							_label = "<span class=\"m-badge m-badge--danger m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak Aktif\"> INACTIVE </span>";
						}
						break;
					case '1':
						_label = "<span class=\"m-badge m-badge--success\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Aktif\">&nbsp;</span>";
						if (_isLong) {
							_label = "<span class=\"m-badge m-badge--success m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Aktif\"> &nbsp;&nbsp;ACTIVE&nbsp;&nbsp; </span>";
						}
						break;
					case 'N':
						_label = "<span class=\"m-badge m-badge--danger\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak Aktif\">&nbsp;</span>";
						if (_isLong) {
							_label = "<span class=\"m-badge m-badge--danger m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak Aktif\"> INACTIVE </span>";
						}
						break;
					case 'Y':
						_label = "<span class=\"m-badge m-badge--success\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Aktif\">&nbsp;</span>";
						if (_isLong) {
							_label = "<span class=\"m-badge m-badge--success m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Aktif\"> &nbsp;&nbsp;ACTIVE&nbsp;&nbsp; </span>";
						}
						break;
					default:
						_label = "";
						break;
				}

				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		yaAtauTidakLabel : (_stat, _isLong) => {
			let _label ="";
			if (typeof _isLong != "string" && typeof _isLong != "number") {
				_isLong = "true";
			}
			if (_stat != null || _stat != '') {
				switch (_stat) {
					case 0:
						_label = "<span class=\"m-font--danger\" style=\"color: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak\">TIDAK</span>";
						if (_isLong == "true") {
							_label = "<span class=\"m-badge m-badge--danger m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak\"> TIDAK </span>";
						}
						break;
					case 1:
						_label = "<span class=\"m-font--success\" style=\"color: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Ya\">YA</span>";
						if (_isLong == "true") {
							_label = "<span class=\"m-badge m-badge--success m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Ya\"> &nbsp;&nbsp;YA&nbsp;&nbsp; </span>";
						}
						break;
					case '0':
						_label = "<span class=\"m-font--danger\" style=\"color: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak\">TIDAK</span>";
						if (_isLong == "true") {
							_label = "<span class=\"m-badge m-badge--danger m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak\"> TIDAK </span>";
						}
						break;
					case '1':
						_label = "<span class=\"m-font--success\" style=\"color: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Ya\">YA</span>";
						if (_isLong == "true") {
							_label = "<span class=\"m-badge m-badge--success m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Ya\"> &nbsp;&nbsp;YA&nbsp;&nbsp; </span>";
						}
						break;
					case 'N':
						_label = "<span class=\"m-font--danger\" style=\"color: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak\">TIDAK</span>";
						if (_isLong == "true") {
							_label = "<span class=\"m-badge m-badge--danger m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #ef4836 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Tidak\"> TIDAK </span>";
						}
						break;
					case 'Y':
						_label = "<span class=\"m-font--success\" style=\"color: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Ya\">YA</span>";
						if (_isLong == "true") {
							_label = "<span class=\"m-badge m-badge--success m-badge--wide m-badge--rounded m--font-boldest2\" style=\"background: #26c281 !important;\" data-toggle=\"m-tooltip\" data-skin=\"dark\" data-placement=\"bottom\" data-original-title=\"Ya\"> &nbsp;&nbsp;YA&nbsp;&nbsp; </span>";
						}
						break;
					default:
						_label = "";
						break;
				}

				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		},
		isNomor:(nilai)=>{
			if(typeof nilai=="number"){
				return true;
			}
			return false;
		},
		appVersiLabel : (_str_versi) => {
			let _label = "";
			if (_str_versi != null || _str_versi != '') {
				if (parseInt(_str_versi) > 0) {
					let _major=parseInt(_str_versi) / 10;
					let _minor=parseInt(_str_versi) % 10;
					_label = "<br/><span class=\"m-badge m-badge--metal m-badge--wide m--font-boldest\"><span class=\"m-badge m-badge--info m-badge--dot\"></span>&nbsp;v"+ _major + "." + _minor + "</span>";
				}
				if (typeof arguments !== 'undefined') {
					if (arguments.length > 1) {
						return Handlebars.SafeString(_label);
					}
				}
			}
			return _label;
		}
	};

	let siakTooltipHandler = ((el) => {
		var skin = el.data('skin') ? 'm-tooltip--skin-' + el.data('skin') : '';
		var width = el.data('width') == 'auto' ? 'm-tooltop--auto-width' : '';
		var triggerValue = el.data('trigger') ? el.data('trigger') : 'hover';

		var template	='<div class="m-tooltip ' + skin + ' ' + width + ' tooltip" role="tooltip">'
							+'<div class="arrow"></div>'
							+'<div class="tooltip-inner"></div>'
						+'</div>';
		el.tooltip({
			trigger: triggerValue,
			template: template
		});
	});

	let siakPortletHandler =((el) => {
		if ( el.data('portlet-initialized') != true ) {
			var these =$(el);
			var portlet = new mPortlet(these[0], {tooltips:false, bodyToggleSpeed: 233});
			el.data('portlet-initialized', true);
		}
	});

	let siakSelectpickerHandler =((el) => {
		el.selectpicker('destroy');
		el.removeAttr('data-size').removeData('size');
		el.attr('data-size', 8).data('size', 8);
		el.removeAttr('data-select-on-tab').removeData('select-on-tab');
		el.attr('data-select-on-tab', true).data('select-on-tab', true);
		// if (!el.attr('data-size')) {
		// 	el.attr('data-size', 8).data('size', 8);
		// }
		el.selectpicker();
	});

	let siakInputmaskHandler =((el) => {
		let container =$(el);
		if ($('.mask-date', container).length > 0) {
			$('.mask-date', container).each((i, o) => {
				$(o).inputmask('remove');
				$(o).inputmask("dd-mm-yyyy", {
					placeholder:"DD-MM-YYYY",
					greedy : false,
					autoUnmask: false,
					clearMaskOnLostFocus: true
				});
			})
		}

		if ($('.mask-time', container).length > 0) {
			$('.mask-time', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("hh:mm", {
					placeholder:"HH:MM",
					greedy : false,
					autoUnmask: false,
					clearMaskOnLostFocus: true
				});
			})
		}

		if ($('.mask-ipv4', container).length > 0) {
			$('.mask-ipv4', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask({
					alias: "ip",
					greedy: true,
					autoUnmask: false,
					clearMaskOnLostFocus: true
				});
			})
		}

		if ($('.mask-lintang', container).length > 0) {
			// let lintang ="^[-+]?(([1-8](\\.[0-9]{1,7})?)|([1-8][0-9](\\.\\d{1,7})?)|(([9][0])(\\.0{1,7})?))$";
			let lintang ="^(\\+|-)?(?:90(?:(?:\\.0{1,7})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,7})?))$";
			$('.mask-lintang', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("Regex", {
					regex : lintang,
					greedy : false,
					autoUnmask: false,
					clearMaskOnLostFocus: true
				});
			})
		}

		if ($('.mask-bujur', container).length > 0) {
			// let bujur ="^[-+]?(([1-8](\\.[0-9]{1,7})?)|([1-8][0-9](\\.\\d{1,7})?)|([1][0-7][0-9](\\.\\d{1,7})?)|(([1][8][0])(\\.0{1,7})?))$";
			let bujur ="^(\\+|-)?(?:180(?:(?:\\.0{1,7})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,7})?))$";
			$('.mask-bujur', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("Regex", {
					regex : bujur,
					greedy : false,
					autoUnmask: false,
					clearMaskOnLostFocus: true
				});
			})
		}

		if ($('.mask-angka', container).length > 0) {
			$('.mask-angka', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("x{+}", {
					definitions: {
						"x": { validator: "[0-9]" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-angka_cari', container).length > 0) {
			$('.mask-angka_cari', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("y{+}", {
					definitions: {
						"y": { validator: "[0-9,]" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-bayi', container).length > 0) {
			$('.mask-bayi', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("z{+}", {
					definitions: {
						"z": { validator: "[0-9,.]" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-nama', container).length > 0) {
			$('.mask-nama', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("0{+}", {
					definitions: {
						"0": { validator: "[a-zA-Z\', .\-]", casing: "upper" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-nama_cari', container).length > 0) {
			$('.mask-nama_cari', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("1{+}", {
					definitions: {
						"1": { validator: "[a-zA-Z\', \*.\-]", casing: "upper" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-alamat', container).length > 0) {
			$('.mask-alamat', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("<{+}", {
					definitions: {
						"<": { validator: "[a-zA-Z0-9\', .\/\(\)\-]", casing: "upper" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-alamat_cari', container).length > 0) {
			$('.mask-alamat_cari', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask(">{+}", {
					definitions: {
						">": { validator: "[a-zA-Z0-9\', \*.\/\(\)\-]", casing: "upper" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-captcha', container).length > 0) {
			$('.mask-captcha', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("*{+}", {
					definitions: {
						"*": { validator: "[a-z0-9]"}
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-nodoc', container).length > 0) {
			$('.mask-nodoc', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("*{+}", {
					definitions: {
						"*": { validator: "[a-zA-Z0-9.\_\/\(\)\-]", casing: "upper" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-nodoc_cari', container).length > 0) {
			$('.mask-nodoc_cari', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("&{+}", {
					definitions: {
						"&": { validator: "[a-zA-Z0-9.,\_\/\(\)\-]", casing: "upper" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-uuid', container).length > 0) {
			$('.mask-uuid', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("`{+}", {
					definitions: {
						"`": { validator: "[a-zA-Z0-9.\_\-]" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}

		if ($('.mask-uuid_cari', container).length > 0) {
			$('.mask-uuid_cari', container).each((i,o) => {
				$(o).inputmask('remove');
				$(o).inputmask("={+}", {
					definitions: {
						"=": { validator: "[a-zA-Z0-9.,\_\-]" }
					},
					greedy:false,
					autoUnmask: true,
					clearMaskOnLostFocus: true
				});
			});
		}
	});

	/*end private method and properties*/
	return {
		init: () => {
			(function ($) {
				$.fn.prefixData = function (prefixNama) {
					let hasil = {};
					if (this.length == 1) {
						let data = $(this).data();
						let filterData = Object.keys(data).filter(function (itm) {
							return listFunction.camelCaseToDash(itm).indexOf(prefixNama) === 0;
						});
						for (let i = 0; i < filterData.length; i++) {
							hasil[listFunction.camelCaseToDash(filterData[i])] = data[filterData[i]];
						}
					}
					return hasil;
				};
				$.fn.select_readonly = function (option_readonly) {
					option_readonly = typeof option_readonly !== 'undefined' ? option_readonly : true;
					this.filter("select").each(function () {
						if (option_readonly) {
							$('option:not(:eq(' + this.selectedIndex + '))', $(this)).attr('disabled', true);
							if ($(this).hasClass("m_selectpicker")) {
								$(this).addClass("readonly");
							}
							$(this).attr('readonly', true);
						}
						else {
							$('option', $(this)).attr('disabled', false);
							if ($(this).hasClass("m_selectpicker")) {
								$(this).removeClass("readonly");
							}
							$(this).attr('readonly', false);
						}
					});
				};
			})(jQuery);
			$(document).ajaxSuccess(function (e, xhr, settings) {
				if (typeof settings.element_target != 'undefined') {
					$(settings.element_target).trigger('ajaxSuccessElement', xhr);
					$(settings.element_target).trigger('afterAjaxSuccess');
				}
			});
			$(document).ajaxError(function (event, request, settings) {
				if (typeof settings.element_target != 'undefined') {
					$(settings.element_target).trigger('ajaxErrorElement', request);
				}
			});
			$.ajaxSetup({
				beforeSend: function (e,xhr,settings)
				{
					// xhr.setRequestHeader("Accept","application/vvv.website+json;version=1");
					// xhr.setRequestHeader("Authorization","Token token=\"FuHCLyY46\"");
				}
			});
			$(document).on('click', '.ajaxify:not([data-konfirmasi])', function (e) {
				e.preventDefault();
				if (!$(this).attr('disabled')) {
					$(this).attr('disabled', true);
					ajax_link(this);
				}
			});
			$(document).on('click', '.ajaxify[data-konfirmasi]', function (e,confirmed) {
				e.preventDefault();
				if (!$(this).attr('disabled')){
					if(!confirmed){
						$(this).attr('disabled', true);
						SiakClient.confirm_simpan(this);
					}else{
						ajax_link(this);
					}

				}
			});
			$(document).on('click',".clickmenu",function(e){
				e.preventDefault();
				//console.log(".ajaxify[href='"+$(this).attr("href")+"']");
				$("a.ajaxify[href='"+$(this).attr("href")+"']").click();
			});
			Object.keys(listClass).forEach(key => {
				let cssClass = listClass[key];
				if (typeof cssClass["validasiError"] != "undefined") {
					$(document).on("validasiError", '.' + key, function (e, xhr) {
						let panggilFungsi = cssClass.validasiError.bind(this);
						panggilFungsi(e, xhr);
					});
				}
				if (typeof cssClass["konfirmasiOk"] != "undefined") {
					$(document).on("konfirmasiOk", '.' + key, function (e, xhr) {
						let panggilFungsi = cssClass.konfirmasiOk.bind(this);
						panggilFungsi(e, xhr);
					});
				}
				if (typeof cssClass["konfirmasiCancel"] != "undefined") {
					$(document).on("konfirmasiCancel", '.' + key, function (e, xhr) {
						let panggilFungsi = cssClass.konfirmasiCancel.bind(this);
						panggilFungsi(e, xhr);
					});
				}
				if (typeof cssClass["ajaxErrorElement"] != "undefined") {
					$(document).on("ajaxErrorElement", '.' + key, function (e, xhr) {
						let panggilFungsi = cssClass.ajaxErrorElement.bind(this);
						panggilFungsi(e, xhr);
					});
				}
				if (typeof cssClass["ajaxSuccessElement"] != "undefined") {
					$(document).on("ajaxSuccessElement", '.' + key, function (e, xhr) {
						let panggilFungsi = cssClass.ajaxSuccessElement.bind(this);
						panggilFungsi(e, xhr);
					});
				}
				if (typeof cssClass["afterAjaxSuccess"] != "undefined") {
					$(document).on("afterAjaxSuccess", '.' + key, function (e) {
						let panggilFungsi = cssClass.afterAjaxSuccess.bind(this);
						panggilFungsi(e);
					});
				}
				if (typeof cssClass["afterMessageSuccess"] != "undefined") {
					$(document).on("afterMessageSuccess", '.' + key, function (e) {
						let panggilFungsi = cssClass.afterMessageSuccess.bind(this);
						panggilFungsi(e);
					});
				}
				if (typeof cssClass["afterMessageError"] != "undefined") {
					$(document).on("afterMessageError", '.' + key, function (e) {
						let panggilFungsi = cssClass.afterMessageError.bind(this);
						panggilFungsi(e);
					});
				}
			});
			jQuery.validator.setDefaults({
				onkeyup: false,
				onclick: false,
				onfocusout: false,
				errorLabelContainer: '#modal_gagal_hidden ul',
				wrapper: "li",
				highlight: function (e) {
					$(e).closest('.row').addClass('has-danger');
				},
				unhighlight: function (e) {
					$(e).closest('.row').removeClass('has-danger');
				},
				focusInvalid: false,
				invalidHandler: function (event, validator) {
					let these =$(validator.currentForm);
					let tipe =(!these.attr("data-tipe")) ? "popup" : these.attr("data-tipe");

					let isiError = $("<ul></ul>");
					validator.errorList.forEach(function (itm) {
						if(itm.message!="-"){
							isiError.append("<li>" + itm.message + "</li>");
						}
					});

					switch (tipe) {
						case "inline":
							SiakClient.peringatan_inline(isiError, these);
							these.trigger('validasiError');
							break;

						default:
							$('#modal_gagal_tulisan').empty();
							$('#modal_gagal_tulisan').append(isiError);
							$('#modal_gagal').modal('show');
							these.trigger('validasiError');
							break;
					}
				}
			});
			/*Validasi format tanggal indonesia dd-mm-yyyy*/
			jQuery.validator.addMethod("dateINA", function(value, element){
				var check = false;
				var re = /^\d{1,2}-\d{1,2}-\d{4}$/;
				if(re.test(value)){
					var adata = value.split('-');
					var gg = parseInt(adata[0],10);
					var mm = parseInt(adata[1],10);
					var aaaa = parseInt(adata[2],10);
					var xdata = new Date(aaaa,mm-1,gg);
					if( (xdata.getFullYear() === aaaa) && (xdata.getMonth() === mm - 1) && (xdata.getDate() === gg) ){
						check = true;
					}else{
						check = false;
					}
				}else{
					check = false;
				}
				return this.optional(element) || check;
			}, "Please enter a correct date");
			/*Validasi input tanggal minimum pakai data-pesan untuk label pesan kesalahan*/
			var input_tgl_minimum_msg = '';
			var input_tgl_minimum_cek = function(){
				return input_tgl_minimum_msg;
			};
			jQuery.validator.addMethod('input_tgl_minimum', function(value, element){
				var cek = false;
				var bday = new Date();
				var tday = new Date();
				var birth = value.split('-');
				var tgl_server=refServer['sekarang']();
				var sekarang=tgl_server.split('-');
				bday.setFullYear(parseInt(birth[2],10),parseInt(birth[1],10)-1,parseInt(birth[0],10));
				tday.setFullYear(parseInt(sekarang[2],10),parseInt(sekarang[1],10)-1,parseInt(sekarang[0],10));

				if(bday > tday){
					input_tgl_minimum_msg = $(element).data('pesan')+" ("+value+")<br/><b>melebihi</b> Tanggal sekarang ("+tgl_server+")";
				}else{
					cek = true;
				}
				return this.optional(element) || cek;
			}, input_tgl_minimum_cek);
			/*Validasi tanggal harus melebihi atau sama dengan tanggal parameter option pakai data-pesan sebagai label pesan kesalahan*/
			var banding_tgl_le_msg = '';
			var banding_tgl_le_cek = function(){
				return banding_tgl_le_msg;
			};
			jQuery.validator.addMethod('banding_tgl_le', function(value, element, options){
				var cek = false;
				var cekdate = value.split('-');
				var bandingDate = $(options).val().split('-');
				var bandingVals = new Date();
				var cekval = new Date();
				cekval.setFullYear(parseInt(cekdate[2],10),parseInt(cekdate[1],10)-1,parseInt(cekdate[0],10));
				bandingVals.setFullYear(parseInt(bandingDate[2],10),parseInt(bandingDate[1],10)-1,parseInt(bandingDate[0],10));

				if(cekval <= bandingVals){
					banding_tgl_le_msg = $(element).data('pesan')+" ("+$(element).val()+") <b>harus</b> <u>melebihi</u> "+$(options).data('pesan')+" ("+$(options).val()+")";
				}else{
					cek = true;
				}
				return this.optional(element) || cek;
			}, banding_tgl_le_cek);
			/*Validasi tanggal harus melebihi tanggal parameter option pakai data-pesan sebagai label pesan kesalahan*/
			var banding_tgl_lt_msg = '';
			var banding_tgl_lt_cek = function(){
				return banding_tgl_lt_msg;
			};
			jQuery.validator.addMethod('banding_tgl_lt', function(value, element, options){
				var cek = false;
				var cekdate = value.split('-');
				var bandingDate = $(options).val().split('-');
				var bandingVals = new Date();
				var cekval = new Date();
				cekval.setFullYear(parseInt(cekdate[2],10),parseInt(cekdate[1],10)-1,parseInt(cekdate[0],10));
				bandingVals.setFullYear(parseInt(bandingDate[2],10),parseInt(bandingDate[1],10)-1,parseInt(bandingDate[0],10));

				if(cekval < bandingVals){
					banding_tgl_lt_msg = $(element).data('pesan')+" ("+$(element).val()+") <b>harus</b> <u>melebihi</u> atau <u>sama</u> dengan "+$(options).data('pesan')+" ("+$(options).val()+")";
				}else{
					cek = true;
				}
				return this.optional(element) || cek;
			}, banding_tgl_lt_cek);
			/*Validasi tanggal harus kurang dari atau sama dengan tanggal parameter option pakai data-pesan sebagai label pesan kesalahan*/
			var banding_tgl_ge_msg = '';
			var banding_tgl_ge_cek = function(){
				return banding_tgl_ge_msg;
			};
			jQuery.validator.addMethod('banding_tgl_ge', function(value, element, options){
				var cek = false;
				var cekdate = value.split('-');
				var bandingDate = $(options).val().split('-');
				var bandingVals = new Date();
				var cekval = new Date();
				cekval.setFullYear(parseInt(cekdate[2],10),parseInt(cekdate[1],10)-1,parseInt(cekdate[0],10));
				bandingVals.setFullYear(parseInt(bandingDate[2],10),parseInt(bandingDate[1],10)-1,parseInt(bandingDate[0],10));

				if(cekval >= bandingVals){
					banding_tgl_ge_msg = $(element).data('pesan')+" ("+$(element).val()+") <b>tidak boleh</b> <u>melebihi</u> atau <u>sama</u> dengan "+$(options).data('pesan')+" ("+$(options).val()+")";
				}else{
					cek = true;
				}
				return this.optional(element) || cek;
			}, banding_tgl_ge_cek);
			/*Validasi tanggal harus kurang dari tanggal parameter option pakai data-pesan sebagai label pesan kesalahan*/
			var banding_tgl_gt_msg = '';
			var banding_tgl_gt_cek = function(){
				return banding_tgl_gt_msg;
			};
			jQuery.validator.addMethod('banding_tgl_gt', function(value, element, options){
				var cek = false;
				var cekdate = value.split('-');
				var bandingDate = $(options).val().split('-');
				var bandingVals = new Date();
				var cekval = new Date();
				cekval.setFullYear(parseInt(cekdate[2],10),parseInt(cekdate[1],10)-1,parseInt(cekdate[0],10));
				bandingVals.setFullYear(parseInt(bandingDate[2],10),parseInt(bandingDate[1],10)-1,parseInt(bandingDate[0],10));

				if(cekval > bandingVals){
					banding_tgl_gt_msg = $(element).data('pesan')+" ("+$(element).val()+") <b>tidak boleh</b> <u>melebihi</u> "+$(options).data('pesan')+" ("+$(options).val()+")";
				}else{
					cek = true;
				}
				return this.optional(element) || cek;
			}, banding_tgl_gt_cek);

			/* Validasi email mengikuti standar resmi RFC-5322 */
			jQuery.validator.addMethod("emailcustom", function(value, element){
				var check = false;
				var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				if(re.test(value)){
					check = true;
				} else {
					check = false;
				}
				return this.optional(element) || check;
			}, "Invalid email address");

			/* Validasi nomor pengguna telepon mengikuti Peraturan Menteri Komunikasi dan Informatika RI Nomor 14 Tahun 2018 */
			jQuery.validator.addMethod("plus62", function(value, element){
				var check = false;
				var re = /^(\(?(?:\+62|62|0)(?:\d{2,3})?\)?)([ .-]?\d{2,4}[ .-]?\d{2,4}[ .-]?\d{2,4})$/;
				if(re.test(value)){
					check = true;
				} else {
					check = false;
				}
				return this.optional(element) || check;
			}, "Invalid phone number");

			/* Validasi Jam */
			jQuery.validator.addMethod("pukul", function(value, element){
				var check = false;
				var re = /^(2[0-3]|[0-1][0-9]):([0-5][0-9])((:[0-5][0-9])?)$/;
				if(re.test(value)){
					check = true;
				} else {
					check = false;
				}
				return this.optional(element) || check;
			}, "Invalid Hour");

			/* form pencarian*/
			$(document).on('submit', 'form.form_cari, form.form_paging, form.form_login', function (e) {
				e.preventDefault();
				if (!$(this).attr('disabled')) {
					$(this).attr('disabled', true);
					if (!$(this).data('nonDisable')) {
						SiakClient.enable_form(this);
					}
					if ($(this).valid()) {
						SiakClient.loading_block();
						json_form(this);
					}
				}
			});
			/*Dropdown wilayah*/
			$(document).on('change', "select.dropdown_wilayah", function (e) {
				let parameter_input = $(this).data('parameter');
				let param_default = $(this).data('default');
				let is_default = false;
				for (let key in parameter_input) {
					if ($('#' + parameter_input[key]).val() == param_default[0] && param_default[0] == 0) {
						is_default = is_default || true;
					}
				}
				let map = $(this).data('map');
				for (key in map) {
					$('#' + key).empty();
					$('#' + key).append($('<option></option>').attr("value", $('#' + key).data('default')[0]).text($('#' + key).data('default')[1]));
					if ($('#' + key).hasClass('dropdown_wilayah')) {
						$('#' + key).trigger('change');
					} else {
						if ($('#' + key).hasClass("m_selectpicker")) {
							siakSelectpickerHandler($('#' + key));
						}
					}
				}

				if (is_default) {
					for (key in map) {
						if ($('#' + key).hasClass("m_selectpicker")) {
							siakSelectpickerHandler($('#' + key));
						}
					}
				} else if (!is_default && $(this).data("url")) {
					$(this).select_readonly();
					ajax_objek(this);
				} else if (!is_default && !$(this).data("url")) {
					if ($(e.currentTarget).hasClass("m_selectpicker")) {
						siakSelectpickerHandler($(e.currentTarget));
					}
				}
			});

			Handlebars.registerHelper('if_authRules', function(inRule,options) {
				if(inRule == "Y"){
					return options.fn(this);
				}
				return options.inverse(this);
			});


			Handlebars.registerHelper('if_flagBsrePengajuanButtonBatal', function(inCertStatus,options) {
				if(inCertStatus == 9 ||
					inCertStatus == 11 ||
						inCertStatus == 12){
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('if_flagBsreVerifikasiButtonBatal', function(inCertStatus,options) {
				if(inCertStatus == 1){
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('if_flagBsreVerifikasiButtonTolak', function(inCertStatus,options) {
				if(inCertStatus == 9 ||
					inCertStatus == 11 ||
						inCertStatus == 12){
					return options.fn(this);
				}
				return options.inverse(this);
			});
			Handlebars.registerHelper('if_flagBsreVerifikasiButtonCetakKutipan', function(inCertStatus,inInfoDokumen,options) {
				if(inCertStatus == 4 &&
					inInfoDokumen.indexOf('K')>-1){
					return options.fn(this);
				}
				return options.inverse(this);
			});
			Handlebars.registerHelper('if_flagBsreVerifikasiButtonCetakRegister', function(inCertStatus,inInfoDokumen,options) {
				if(inCertStatus == 4 &&
					inInfoDokumen.indexOf('R')>-1){
					return options.fn(this);
				}
				return options.inverse(this);
			});
			Handlebars.registerHelper('if_flagBsrePengajuanButtonCrud', function(inCertStatus,options) {
				if(inCertStatus == null ||
					inCertStatus == 0 ||
						inCertStatus == 91 ||
							inCertStatus == 92){
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('if_flagBsreVerifikasiButtonCrud', function(inCertStatus,options) {
				if(inCertStatus == 9 ||
					inCertStatus == 11 ||
						inCertStatus == 12){
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('if_flagBsrePembubuhanButtonCrud', function(inCertStatus,options) {
				if(inCertStatus == 1) {
					return options.fn(this);
				}
				return options.inverse(this);
			});


			Handlebars.registerHelper('getBsreInfo', function() {
				return listFunction["bsreInfo"].apply(null, arguments);
			});

			Handlebars.registerHelper('getBsreLabel', function() {
				return listFunction["bsreLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getBioWargaNegaraLabel', function() {
				return listFunction["bioWargaNegaraLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getOaImigrasiLabel', function() {
				return listFunction["oaImigrasiLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getBioFlagPindah', function() {
				return listFunction["bioFlagPindah"].apply(null, arguments);
			});
			Handlebars.registerHelper('getKkFlagPindahIconLabel', function() {
				return listFunction["kkFlagPindahIconLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getBioFlagPindahIconLabel', function() {
				return listFunction["bioFlagPindahIconLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getBioFlagStatus', function() {
				return listFunction["bioFlagStatus"].apply(null, arguments);
			});
			Handlebars.registerHelper('getBioFlagStatusIconLabel', function() {
				return listFunction["bioFlagStatusIconLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getKkTipeLabel', function() {
				return listFunction["kkTipeLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getUserGroupLevelLabel', function() {
				return listFunction["userGroupLevelLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getStatusAktifLabel', function() {
				return listFunction["statusAktifLabel"].apply(null, arguments);
			});
			Handlebars.registerHelper('getYaAtauTidakLabel', function() {
				return listFunction["yaAtauTidakLabel"].apply(null, arguments);
			});


			Handlebars.registerHelper('isNomor', function() {
				return listFunction["isNomor"].apply(null, arguments);
			});

			Handlebars.registerHelper('getAppVersiLabel', function() {
				return listFunction["appVersiLabel"].apply(null, arguments);
			});

			Handlebars.registerHelper('getBsreColor', function(inCertStatus,inPrefix) {
				if(inCertStatus == 9)
					return 'm-badge--accent';
				else if(inCertStatus == 91)
					return 'bg-color_marun';
				else if(inCertStatus == 92)
					return 'bg-color_marun';
				else if(inCertStatus == 1)
					return 'bg-color_ungu';
				else if(inCertStatus == 11)
					return 'bg-color_marun';
				else if(inCertStatus == 12)
					return 'bg-color_marun';
				else if(inCertStatus == 4)
					return 'm-badge--primary';
			});


			Handlebars.registerHelper('if_flagPindah', function(inFlagPindah,options) {
				if(inFlagPindah != ''){
					if(inFlagPindah == '1' ||
						inFlagPindah == '2' ||
							inFlagPindah == '3' ||
								inFlagPindah == '4' ||
									inFlagPindah == '5' ||
										inFlagPindah == '6' ||
											inFlagPindah == '9')
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('getInfoFlagPindah', function(inFlagPindah,inPrefix) {
				if(inFlagPindah != ''){
					if(inFlagPindah == '1')
						return inPrefix + ' dalam proses pindah(Dalam satu Desa/Kelurahan)';
					else if(inFlagPindah == '2')
						return inPrefix + ' dalam proses pindah(Antar Desa/Kelurahan)';
					else if(inFlagPindah == '3')
						return inPrefix + ' dalam proses pindah(Antar Kecamatan)';
					else if(inFlagPindah == '4')
						return inPrefix + ' dalam proses pindah(Antar Kab./Kota)';
					else if(inFlagPindah == '5')
						return inPrefix + ' dalam proses pindah(Antar Provinsi)';
					else if(inFlagPindah == '6')
						return inPrefix + ' dalam proses pindah(Ke Luar Negeri)';
					else if(inFlagPindah == '9')
						return inPrefix + ' Flag Status Mati';
					else
						return inPrefix+ ' Flag Status tidak diketahui';
				}
			});

			Handlebars.registerHelper('if_flagStatusBiodata', function(inFlagStatus,options) {
				if(inFlagStatus != '0'){
					return options.fn(this);
				}
				return options.inverse(this);
			});


			Handlebars.registerHelper('getInfoFlagStatusBiodata', function(inFlagStatus) {
				if(inFlagStatus != ''){
					if(inFlagStatus == '1')
						return 'Biodata Flag Status Mati';
					else if(inFlagStatus == '2')
						return 'Biodata dalam proses pindah';
					else if(inFlagStatus == '3')
						return 'Pindah ke luar negeri';
					else if(inFlagStatus == '4')
						return 'Duplicate/Indikasi Ganda';
					else if(inFlagStatus == '5')
						return 'Berada di luar negeri';
					else if(inFlagStatus == '7')
						return 'WNI menjadi OA';
					else if(inFlagStatus == '8')
						return 'Telah datang di tujuan';
					else if(inFlagStatus == '9')
						return 'Pembuatan Akta Kelahiran belum dilanjutkan';
					else if(inFlagStatus == 'L')
						return 'Anomali';
					else if(inFlagStatus == 'K')
						return 'Tidak Aktif';
					else
						return 'Flag Status tidak diketahui'
				}
			});


			Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
				if (arguments.length < 4) {
					// Operator omitted, assuming "+"
					options = rvalue;
					rvalue = operator;
					operator = "+";
				}

				lvalue = parseFloat(lvalue);
				rvalue = parseFloat(rvalue);

				return {
					"+": lvalue + rvalue,
					"-": lvalue - rvalue,
					"*": lvalue * rvalue,
					"/": lvalue / rvalue,
					"%": lvalue % rvalue
				}[operator];
			});
			Handlebars.registerHelper("formatDate", function (datetime, format, fromFormat) {
				return listFunction.formatDate(datetime, format, fromFormat);
			});
			Handlebars.registerHelper("descKelamin", function (kode) {
				if (typeof refWni["801"] != "undefined") {
					let filteredArray = refWni["801"].filter(function (itm) {
						return itm.hasOwnProperty(kode);
					});
					if (filteredArray.length == 1) {
						return filteredArray[0][kode];
					}
				}
				return '0';
			});
			Handlebars.registerHelper("stripEmpty", function (kode) {
				return listFunction.stripEmpty(kode);
			});
			Handlebars.registerHelper("strPad", function (kode, jml) {
				return listFunction.pad(kode, jml);
			});
			Handlebars.registerHelper("formatNumber", function (num) {
				return Intl.NumberFormat("id").format(num)
			});
			Handlebars.registerHelper("refWni", function () {
				return listFunction["refWni"].apply(null, arguments);
			});
			Handlebars.registerHelper("refAction", function () {
				return listFunction["refAction"].apply(null, arguments);
			});
			Handlebars.registerHelper("refMod", function () {
				return listFunction["refMod"].apply(null, arguments);
			});
			Handlebars.registerHelper("refWna", function () {
				return listFunction["refWna"].apply(null, arguments);
			});
			Handlebars.registerHelper({
				eq: function (v1, v2) {
					return v1 === v2;
				},
				ne: function (v1, v2) {
					return v1 !== v2;
				},
				lt: function (v1, v2) {
					return v1 < v2;
				},
				gt: function (v1, v2) {
					return v1 > v2;
				},
				lte: function (v1, v2) {
					return v1 <= v2;
				},
				gte: function (v1, v2) {
					return v1 >= v2;
				},
				and: function () {
					return Array.prototype.slice.call(arguments).every(Boolean);
				},
				or: function () {
					return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
				}
			});
			/*Untuk Kembali*/
			$(document).on('click', '.kembali', function (e) {
				e.preventDefault();
				SiakClient.loading_block();
				if($(this).is('[data-toggle="m-tooltip"]')){
					$(this).tooltip("hide");
				}
				if($(this).parent().is('[data-toggle="m-tooltip"]')){
					$(this).parent().tooltip("hide");
				}
				$('#' + $(this).data('hidden')).hide();
				$('#' + $(this).data('hidden')).empty();
				$('#' + $(this).data('target')).show();
				if ($(this).data("top")) {
					mApp.scrollTop();
				}
				SiakClient.loading_unblock();
			});
			$(document).on("click",".pagingPrev,.pagingNext",function(e){
				let inputPage=$(this).parent().siblings("[name='page']").get(0);
				if($(this).hasClass("pagingPrev")){
					$(inputPage).val(parseInt($(inputPage).val())-1);
				}else{
					$(inputPage).val(parseInt($(inputPage).val())+1);
				}
				$(inputPage).closest("form").submit();
			});
			$(document).on("click",".sorting,.sorting_desc,.sorting_asc",function(e){
				let tableResponse=$(this).closest("div.table-responsive");
				let formPage=$(".form_cari",tableResponse).get(0);
				let inputOrder=$("[name='order']",formPage).get(0);
				// console.log({tableResponse:tableResponse,formPage:formPage,inputOrder:inputOrder});
				$("[name='page']",formPage).val(1);
				if($(this).hasClass("sorting_asc")){
					$(inputOrder).val($(this).data("kolom")+" desc");
				}else{
					$(inputOrder).val($(this).data("kolom"));
				}
				$(formPage).submit();
			});
			/*Untuk Konfirmasi*/
			$('#korfirmasi_ya').on('click', function (e) {
				$(this).attr('disabled', true);
				if ($('#modal_konfirmasi').data('modal-options-relatedTarget')) {
					$($('#modal_konfirmasi').data('modal-options-relatedTarget')).trigger('konfirmasiOk');
				}
				$('#modal_konfirmasi').data('modal-options-hideTarget', this);
				$('#modal_konfirmasi').modal('hide');
			});
			$('#korfirmasi_tdk').on('click', function (e) {
				if ($('#modal_konfirmasi').data('modal-options-relatedTarget')) {
					$($('#modal_konfirmasi').data('modal-options-relatedTarget')).trigger('konfirmasiCancel');
					$('#modal_konfirmasi').data('modal-options-hideTarget', this);
				}
			});
			$('#modal_konfirmasi').on('hide.bs.modal', function (e) {
				if (!$(this).data('modal-options-hideTarget')) {
					$('#korfirmasi_tdk').trigger('click');
				} else {
					$(this).removeData('modal-options-hideTarget');
				}
			});
			/*Untuk pesan kesalahan*/
			$('#modal_gagal').on('show.bs.modal', function (e) {
				$('#modal_gagal_tulisan').show();
			});
			/*Untuk fokus tombol pesan*/
			$('#modal_berhasil,#modal_konfirmasi,#modal_gagal').on('shown.bs.modal', function (e) {
				$('.btn-focus', $(this)).focus();
			});
			/*untuk modal berhasil*/
			$("#modal_berhasil").on("hide.bs.modal", function (e) {
				if ($(this).data('modal-options-relatedTarget')) {
					$($(this).data('modal-options-relatedTarget')).trigger("afterMessageSuccess");
					$(this).removeData('modal-options-hideTarget');
				}
			});
			/*untuk modal gagal*/
			$("#modal_gagal").on("hide.bs.modal", function (e) {
				if ($(this).data('modal-options-relatedTarget')) {
					$($(this).data('modal-options-relatedTarget')).trigger("afterMessageError");
					$(this).removeData('modal-options-hideTarget');
				} else {

				}
			});
			/*Form input dengan konfirmasi*/
			$(document).on('submit', 'form.form_input', function (e, confirmed) {
				e.preventDefault();
				if (!$(this).attr('disabled')) {
					$(this).attr('disabled', true);
					if (!$(this).data('nonDisable')) {
						SiakClient.enable_form(this);
					}
					if ($(this).valid()) {
						if (!confirmed) {
							SiakClient.confirm_simpan(this);
						} else {
							SiakClient.loading_block();
							json_form(this);
						}
					}
				}
			});

			$(document).on('submit', 'form.form_default', function (e) {
				e.preventDefault();
				if (!$(this).attr('disabled')) {
					$(this).attr('disabled', true);
					if (!$(this).data('nonDisable')) {
						SiakClient.enable_form(this);
					}
					if ($(this).valid()) {
						SiakClient.loading_block();
						json_form(this);
					}
				}
			});
			/*untuk tombol pencarian biodata*/
			$(document).on('click', ".cari_biodata", function (e) {
				e.preventDefault();
				if (!$(this).attr('disabled')) {
					$(this).attr('disabled', true);
					json_objek(this);
				}
			});
			/*Tombol reset biodata*/
			$(document).on('click', ".reset_biodata", function (e) {
				e.preventDefault();
				reset_ajax(this);
			});
			ajax_ref_wni();
			ajax_ref_activity();
			ajax_ref_wna();
			// nw.Window.get().maximize();
		},
		initAjax :(el) => {
			_initAjax(el)
		},
		initInputmask :(target) => {
			siakInputmaskHandler(target);
		},
		initUtil : (target) => {
			if ($('[data-toggle="m-tooltip"]', target).length > 0) {
				$('[data-toggle="m-tooltip"]', target).each((i,o) => {
					siakTooltipHandler($(o));
				});
			}

			if ($('[m-portlet="true"]', target).length > 0) {
				$('[m-portlet="true"]', target).each((i,o) => {
					siakPortletHandler($(o));
				});
			}

			if ($('select.m_selectpicker', target).length > 0) {
				$('select.m_selectpicker', target).each((i,o) => {
					siakSelectpickerHandler($(o));
				});
			}
			SiakClient.initInputmask(target);
		},
		loading_block: () => {
			mApp.block($("body"), {
				overlayColor: '#000000',
				type: 'loader',
				state: 'success',
				message: 'Harap tunggu...'
			});
		},
		loading_unblock: () => {
			mApp.unblock($("body"));
		},
		peringatan: (pesan, object_html) => {
			if (object_html) {
				$('#modal_gagal').data('modal-options-relatedTarget', object_html);
			}
			$('#modal_gagal_tulisan').html(pesan);
			$('#modal_gagal').modal('show');
		},
		peringatan_inline: (pesan, object_html) => {
			if (object_html) {
				var l = $('<div class="m-alert m-alert--outline alert alert-danger alert-dismissible" role="alert">\t\t\t<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\t\t\t<span></span>\t\t</div>');
				object_html.find(".alert").remove(),
				l.prependTo(object_html),
				mUtil.animateClass(l[0], "fadeIn animated"),
				l.find("span").html(pesan);
			} else {
				SiakClient.peringatan(pesan);
			}
		},
		enable_form: (object_html) => {
			$('input:disabled,select:disabled', object_html).addClass('disabled');
			$('input:disabled,select:disabled', object_html).attr('disabled', false);
		},
		disable_form: (object_html) => {
			$('input.disabled,select.disabled', object_html).attr('disabled', true);
			$('input.disabled,select.disabled', object_html).removeClass('disabled');
		},
		sukses: function (pesan, object_html) {
			if (object_html) {
				$('#modal_berhasil').data('modal-options-relatedTarget', object_html);
			}
			$('#modal_berhasil_tulisan').html(pesan);
			$('#modal_berhasil').modal('show');
		},
		confirm_simpan: function (object_html) {
			$('#modal_konfirmasi').data('modal-options-relatedTarget', object_html);
			$('#modal_konfirmasi_tulisan').html($(object_html).data('konfirmasi'));
			$('#modal_konfirmasi').modal('show');
			$('#korfirmasi_ya').attr('disabled', false);
			$('#modal_konfirmasi').removeData('modal-options-hideTarget');
		},
		formatBytes : function(bytes, decimals, units) {
			if (typeof decimals === 'undefined') {
				decimals =2;
			}
			if (typeof units === 'undefined') {
				units =true;
			}

			if (typeof bytes === 'undefined' || (bytes === 0)) {
				return '0 Byte';
			} else {
				const k = 1024;
				const dm = decimals < 0 ? 0 : decimals;
				const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

				const i = Math.floor(Math.log(bytes) / Math.log(k));
				if (units) {
					return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
				} else {
					return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ';
				}
			}
		},
		uuid : function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
				function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
		},
		getUrlServer : function() {
			return urlServer;
		},
		tektokCariBiodata : (btn, pNik, pNama) => {
			let nik =$.trim(pNik.val());
			btn.on('ajaxErrorElement', (e) => {
				// e.stopPropagation();
				if (pNik.is(':disabled')) {
					pNik.prop('disabled', false);
				}

				if (pNik.is('[readonly]')) {
					pNik.prop('readonly', false);
				}

				if (pNik.hasClass('disabled')) {
					pNik.removeClass('disabled');
				}

				if (pNama.is(':disabled')) {
					pNama.prop('disabled', false);
				}

				if (pNama.is('[readonly]')) {
					pNama.prop('readonly', false);
				}

				if (pNama.hasClass('disabled')) {
					pNama.removeClass('disabled');
				}
			});

			if (nik == "" || nik == 0) {
				pNik.val("");
				pNik.prop("disabled", false).prop("readonly", false);
				if (btn.hasClass("reset_biodata")) {
					setTimeout(() => { btn.click(); }, 100);
				}
			}

			if (nik.length >= 16) {
				if (btn.hasClass("reset_biodata")) {
					btn.removeClass("reset_biodata");
					btn.addClass("cari_biodata");
				}
				pNik.val(nik);
				setTimeout(() => { btn.click(); }, 500);
			}

			if (typeof pNama !== 'undefined') {
				let nama =$.trim(pNama.val());
				if (nama.length == 0) {
					pNama.prop("disabled", false).prop("readonly", false);
				} else {
					if (nik.length < 16) {
						pNama.prop("disabled", false).prop("readonly", false);
					}
				}
			}
		},
		getUserLevelLabel :(_level) => {
			return listFunction.userGroupLevelLabel(_level);
		},
		notifyExecTime :(desc, stat) => {
			var content ={};
			content.title ='Execution Time';
			content.icon ='icon flaticon-stopwatch';
			content.message = desc;
			var template	='<div data-notify="container" class="alert alert-secondary m-alert" role="alert">'
								+'<button type="button" aria-hidden="true" class="close" data-notify="dismiss"></button>'
								+'<span data-notify="icon" class="m--font-{0}"></span>'
								+'<span data-notify="title" class="m--font-{0}">{1}</span>'
								+'<span data-notify="message">{2}</span>'
							+'</div>';
			var notify = $.notify(content, {
				type: stat,
				allow_dismiss: true,
				newest_on_top: true,
				mouse_over: false,
				showProgressbar: false,
				spacing: 8,
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				},
				offset: {
					x: 21,
					y: 13
				},
				delay: 1500,
				z_index: 9999,
				animate: {
					enter: 'animated fadeInUp',
					exit: 'animated fadeOutDown'
				},
				template : template
			});
		},
		dynamicKnownValidation :(object_html, type, validParam, validMessage) => {
			return {
				add : () => {
					$(object_html).attr('data-rule-' + type, validParam).data('rule-' + type, validParam);
					$(object_html).attr('data-msg-' + type, validMessage).data('msg-' + type, validMessage);
					// SiakClient.dynamicKnownValidation(object_html,type,validParam,validMessage).remove();
				},
				remove : () => {
					$(object_html).removeAttr('data-rule-' + type).removeData('rule-' + type);
					$(object_html).removeAttr('data-msg-' + type).removeData('msg-' + type);
				}
			}
		},
		translateFunction : (object_html, data) => {
			if (typeof data == 'string' || typeof data == 'number') {
				if ($(object_html).data("function")) {
					if (typeof $(object_html).data("function") == "string") {
						data = listFunction[$(object_html).data("function")](data);
					} else {
						let panggilFungsi = Object.assign([], $(object_html).data("function"));

						let namaFungsi = panggilFungsi.shift();
						panggilFungsi.unshift(data);
						data = listFunction[namaFungsi].apply(null, panggilFungsi);
					}
				}
				$(object_html).html(data);
			} else if (data == null) {
				$(object_html).html('');
			}
		},
		takeSnapshot : () => {
			// var gui = require('nw.gui');
			// var win = gui.Window.get();

			// win.captureScreenshot({fullSize: true}, (err, data) => {
			// 	if (err) {
			// 		alert(err.message);
			// 		return;
			// 	}

			// 	var a = document.createElement("a"); //Create <a>
			// 	a.href = 'data:image/png;base64,' + data;//Image Base64 Goes here
			// 	a.download = "Image.png"; //File name Here
			// 	a.click();
			// });
		},
		initSession:async ()=>{
			// let machineId=funcMachineId.machineIdSync();
			// const lookupPromise = new Promise((resolve, reject) => {
			// 	funcDns.lookup(funcOs.hostname(), (err, address, family) => {
			// 		if(err) reject(err);
			// 		resolve(address);
			// 	});
			// });
			// let localAddress=await lookupPromise;
			// let postAuth=JSON.stringify({"idComp":machineId,"ipAddress":localAddress,"version":version});
			// let result=await $.ajax({url:urlServer+"auth/client/procAccessToken",
			// 	type: "POST",
			// 	data: postAuth,
			// 	contentType: "application/json",
			// 	dataType: "json"
			// });
			// console.log(result);
		}
	}
})();

SiakClient.init();

function AgeYearServer(monthDob, dayDob, yearDob, yearNow, monthNow, dayNow) {
	if (yearNow < 100) {
		yearNow = yearNow + 1900;
	}
	monthDob++;
	yearAge = yearNow - yearDob;
	if (monthNow <= monthDob) {
		if (monthNow < monthDob) {
			yearAge--;
		} else {
			if (dayNow < dayDob) {
				yearAge--;
			}
		}
	}
	return yearAge;
}

function siakValidDate(text) {
	var comp = text.split('-');
	var d = parseInt(comp[0], 10);
	var m = parseInt(comp[1], 10);
	var y = parseInt(comp[2], 10);
	if (isNaN(d)) {
		return false;
	}
	if (isNaN(m)) {
		return false;
	}
	if (isNaN(y)) {
		return false;
	}
	if (String(d).length < 1) {
		return false;
	}
	if (String(m).length < 1) {
		return false;
	}
	if (String(y).length < 4) {
		return false;
	}
	var date = new Date(y, m - 1, d);
	if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
		return true;
	}
	return false;
}

function siakDiffDay(vFirstDate, vSecondDate) {
	var oneDay = 24 * 60 * 60 * 1000;
	return Math.round(Math.abs((vFirstDate.getTime() - vSecondDate.getTime()) / (oneDay)));
}
