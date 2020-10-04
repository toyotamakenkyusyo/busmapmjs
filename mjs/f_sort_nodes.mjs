//グラフを作り、整列した節点の列をつくる
export function f_sort_nodes(a_walk_array/*: {
	"node_array": string[]; //節点idの列（グラフ1）
}[]*/)/*: string[] //節点idの配列*/ {
	
	//グラフ1：全ての節点を含むグラフ
	const c_graph_1 /*:{
		"nodes" : { //節点達
			[key: string]: { //節点id
				"next_nodes": { // 隣接する節点達
					[key: string]: string; //節点id
				};
				"degree": number; //次数
			};
		};
	}*/= {"nodes":{}};
	
	//グラフ2：グラフ1から次数2の節点を除いたグラフ
	//多重辺はないので問題ない。self-loopは？
	const c_graph_2 /*: {
		"nodes": { //節点達
			[key: string]: { //節点id
				"next_nodes": { // 隣接する節点達
					[key: string]: string; //節点id
				};
				"next_links": { // 隣接する辺達
					[key: string]: string; //辺id
				};
			};
		};
		"links": { //辺達
			[key: string]: { //辺id
				"head": string; //始点の節点id
				"tail": string; //始点の節点id
				"node_array_1": string; //中間の節点idを_区切りでつないだ文字列
				"node_array_2": string; //中間の節点idを_区切りでつないだ文字列
				"code": number; //適当な順番をつけた正整数
				"direction": number; //向き（1か-1）
			};
		};
	}*/ = {"nodes": {}, "links": {}};
	
	const c_walk_array_2/*: {
		"link_array": { //辺の列（グラフ2）
			"link_id": string; //辺id
			"direction": number; //向き（1か-1）
			"node_array_1": string; //節点idを順に_区切りでつないだ文字列
			"node_array_2": string; //節点idを逆順に_区切りでつないだ文字列
		}[];
	}[]*/ = [];
	
	
	//入力データからグラフ1をつくる
	for (let i1 = 0; i1 < a_walk_array.length; i1++) {
		for (let i2 = 0; i2 < a_walk_array[i1]["node_array"].length; i2++) {
			const c_node_id/*: string*/ = a_walk_array[i1]["node_array"][i2]; //節点id
			if (c_graph_1["nodes"][c_node_id] === undefined) { //まだその節点がないなら
				//節点を追加
				c_graph_1["nodes"][c_node_id] = {
					"next_nodes": {},
					"degree": null
				};
			}
			if (i2 !== 0) { //最初以外
				const c_from_node_id/*: string*/ = a_walk_array[i1]["node_array"][i2 - 1]; //前の節点の節点id
				//前の節点を隣接する節点達に追加（重複あり）
				c_graph_1["nodes"][c_node_id]["next_nodes"][c_from_node_id] = c_from_node_id;
			}
			if (i2 !== a_walk_array[i1]["node_array"].length - 1) { //最後以外
				const c_to_node_id/*: string*/ = a_walk_array[i1]["node_array"][i2 + 1]; //後の節点の節点id
				//後の節点を隣接する節点達に追加（重複あり）
				c_graph_1["nodes"][c_node_id]["next_nodes"][c_to_node_id] = c_to_node_id; 
			}
		}
	}
	
	//グラフ1の節点の次数を求める
	for (let i1 in c_graph_1["nodes"]) {
		c_graph_1["nodes"][i1]["degree"] = Object.keys(c_graph_1["nodes"][i1]["next_nodes"]).length; //節点の次数
	}
	
	//グラフ2をつくる
	//グラフ2のリンクをc_walk_array_2に追加
	for (let i1 = 0; i1 < a_walk_array.length; i1++) {
		c_walk_array_2.push({"link_array": []});
	}
	
	
	for (let i1 = 0; i1 < a_walk_array.length; i1++) {
		let l_head/*: string*/ = null; //最初の節点id
		let l_node_array_1/*: string*/ = "_"; //節点idを_区切りで順に繋げた文字列
		let l_node_array_2/*: string*/ = "_"; //節点idを_区切りで逆順に繋げた文字列
		//次数2でない節点（端の点、分岐点）で分割してリンクをつくる
		for (let i2 = 0; i2 < a_walk_array[i1]["node_array"].length; i2++) {
			const c_node_id /*: string*/ = a_walk_array[i1]["node_array"][i2]; //節点id
			l_node_array_1 = l_node_array_1 + c_node_id + "_";
			l_node_array_2 = "_" + c_node_id + l_node_array_2;
			if (c_graph_1["nodes"][c_node_id]["degree"] === 2) { //次数2、途中の点
				if (i2 === a_walk_array[i1]["node_array"].length - 1) { //最後の場合
					c_walk_array_2[i1]["link_array"].push({
						"link_id": null,
						"direction": null,
						"node_array_1": l_node_array_1,
						"node_array_2": l_node_array_2
					});
				}
			} else { //端の点、分岐点
				if (l_head === null) { //途中の点で始まっている場合
					c_walk_array_2[i1]["link_array"].push({
						"link_id": null,
						"direction": null,
						"node_array_1": l_node_array_1,
						"node_array_2": l_node_array_2
					});
				} else { //途中の点以外で始まっている場合
					if (c_graph_2["nodes"][l_head] === undefined) {
						c_graph_2["nodes"][l_head] = {
							"next_nodes": {},
							"next_links": {}
						};
					}
					if (c_graph_2["nodes"][c_node_id] === undefined) {
						c_graph_2["nodes"][c_node_id] = {
							"next_nodes": {},
							"next_links": {}
						};
					}
					c_graph_2["nodes"][l_head]["next_nodes"][c_node_id] = c_node_id;
					c_graph_2["nodes"][c_node_id]["next_nodes"][l_head] = l_head;
					if (l_head <= c_node_id) { //適当な順を一意に固定する
						c_graph_2["links"][l_node_array_1] = {
							"head": l_head,
							"tail": c_node_id
						};
						c_graph_2["nodes"][l_head]["next_links"][l_node_array_1] = l_node_array_1;
						c_graph_2["nodes"][c_node_id]["next_links"][l_node_array_1] = l_node_array_1;
						c_walk_array_2[i1]["link_array"].push({
							"link_id": l_node_array_1,
							"direction": 1,
							"node_array_1": null,
							"node_array_2": null
						});
					} else {
						c_graph_2["links"][l_node_array_2] = {
							"head": c_node_id,
							"tail": l_head
						};
						c_graph_2["nodes"][l_head]["next_links"][l_node_array_2] = l_node_array_2;
						c_graph_2["nodes"][c_node_id]["next_links"][l_node_array_2] = l_node_array_2;
						c_walk_array_2[i1]["link_array"].push({
							"link_id": l_node_array_2,
							"direction": -1,
							"node_array_1": null,
							"node_array_2": null
						});
					}
				}
				//次のリンクへ初期化
				l_head = c_node_id;
				l_node_array_1 = "_" + c_node_id + "_";
				l_node_array_2 = "_" + c_node_id + "_";
			}
		}
	}
	
	//端の一部のやつ（端の節点の次数が2でない）の節点idと向きを求める
	//含まれる辺idを探す
	//同じ処理が必要なやつが途中にあるとうまくいかない？
	for (let i1 = 0; i1 < c_walk_array_2.length; i1++) {
		const c_first/*: {
			"link_id": string; //辺id、未定はnull
			"direction": number; //向き1か-1、未定はnull
			"node_array_1": string; //節点idを順に_区切りでつないだ文字列
			"node_array_2": string; //節点idを逆順に_区切りでつないだ文字列
		}*/ = c_walk_array_2[i1]["link_array"][0];
		const c_last /*: {
			"link_id": string; //辺id、未定はnull
			"direction": number; //向き1か-1、未定はnull
			"node_array_1": string; //節点idを順に_区切りでつないだ文字列
			"node_array_2": string; //節点idを逆順に_区切りでつないだ文字列
		}*/= c_walk_array_2[i1]["link_array"][c_walk_array_2[i1]["link_array"].length - 1];
		if (c_first["link_id"] === null) {
			for (let i2 in c_graph_2["links"]) {
				if (i2.indexOf(c_first["node_array_1"]) !== -1) { //辺idの文字列が含まれる
					c_first["link_id"] = i2;
					c_first["direction"] = 1;
					break;
				} else if (i2.indexOf(c_first["node_array_2"]) !== -1) { //辺idの文字列が含まれる
					c_first["link_id"] = i2;
					c_first["direction"] = -1;
					break;
				}
			}
		}
		if (c_last["link_id"] === null) {
			for (let i2 in c_graph_2["links"]) {
				if (i2.indexOf(c_last["node_array_1"]) !== -1) { //辺idの文字列が含まれる
					c_last["link_id"] = i2;
					c_last["direction"] = 1;
					break;
				} else if (i2.indexOf(c_last["node_array_2"]) !== -1) { //辺idの文字列が含まれる
					c_last["link_id"] = i2;
					c_last["direction"] = -1;
					break;
				}
			}
		}
	}
	
	console.log(c_graph_2);
	
	//グラフ2の辺に適当な順番をつける（順番は向き付けに使う）
	let l_count /*: number*/ = 1; //連続した正整数
	for (let i1 in c_graph_2["links"]) {
		c_graph_2["links"][i1]["code"] = l_count;
		l_count += 1;
	}
	
	
	const c_acyclic/*: {
		"code": number; //向きをつける番号
		"score": number; //点数
	}*/ = [];
	//2 ** l_count通りについて、ループの有無を判定し、点数をつける
	for (let i1 = 1; i1 < 2 ** l_count; i1++) {
		const c_next_nodes/*: {
			[key: string]: { //節点id
				"next_nodes": {
					[key: string]: string; //節点id
				};
				"cyclic": boolean; //巡回したらtrue
			};
		}*/ = {}; //ここに隣接する節点の節点idを入れていく。
		for (let i2 in c_graph_2["links"]) {
			const c_direction/*: number*/ = -1 + 2 * (Math.floor(i1 / (2 ** c_graph_2["links"][i2]["code"])) % 2); //向き（-1か1）
			c_graph_2["links"][i2]["direction"] = c_direction;
			if (c_direction === -1) {
				if (c_next_nodes[c_graph_2["links"][i2]["head"]] === undefined) {
					c_next_nodes[c_graph_2["links"][i2]["head"]] = {
						"next_nodes": {},
						"cyclic": null
					};
				}
				c_next_nodes[c_graph_2["links"][i2]["head"]]["next_nodes"][c_graph_2["links"][i2]["tail"]] = c_graph_2["links"][i2]["tail"];
			} else if (c_direction === 1) {
				if (c_next_nodes[c_graph_2["links"][i2]["end"]] === undefined) {
					c_next_nodes[c_graph_2["links"][i2]["tail"]] = {
						"next_nodes": {},
						"cyclic": null
					};
				}
				c_next_nodes[c_graph_2["links"][i2]["tail"]]["next_nodes"][c_graph_2["links"][i2]["head"]] = c_graph_2["links"][i2]["head"];
			}
		}
		//巡回の有無を判定
		f_check_cyclic();
		function f_check_cyclic() {
			let l_exist/*: boolean*/ = false;
			for (let i2 in c_next_nodes) {
				if (c_next_nodes[i2]["cyclic"] !== false) {
					let l_next_node_count/*: number*/ = Object.keys(c_next_nodes[i2]["next_nodes"]).length;
					for (let i3 in c_next_nodes[i2]["next_nodes"]) {
						if (c_next_nodes[i3] === undefined) {
							l_next_node_count -= 1;
						} else if (c_next_nodes[i3]["cyclic"] === false) {
							l_next_node_count -= 1;
						}
					}
					if (l_next_node_count <= 0) {
						l_exist = true;
						c_next_nodes[i2]["cyclic"] = false;
					}
				}
			}
			if (l_exist === true) {
				f_check_cyclic();
			}
		}
		let l_exist/*: boolean*/ = false; //巡回があればtrue
		for (let i2 in c_next_nodes) {
			if (c_next_nodes[i2]["cyclic"] !== false) {
				l_exist = true; //巡回あり
			}
		}
		if (l_exist === false) { //巡回なし
			//点数をつける
			let l_score/*: number*/ = 0; //点数（大きいほどよい）
			for (let i2 = 0; i2 < c_walk_array_2.length; i2++) {
				for (let i3 = 0; i3 < c_walk_array_2[i2]["link_array"].length - 1; i3++) {
					const c_section_1/*: string*/ = c_walk_array_2[i2]["link_array"][i3]["link_id"];
					const c_section_2/*: string*/ = c_walk_array_2[i2]["link_array"][i3 + 1]["link_id"];
					l_score += c_graph_2["links"][c_section_1]["direction"] * c_walk_array_2[i2]["link_array"][i3]["direction"] * c_graph_2["links"][c_section_2]["direction"] * c_walk_array_2[i2]["link_array"][i3 + 1]["direction"];
				}
			}
			
			//記録
			c_acyclic.push({
				"code": i1,
				"score": l_score
			});
		}
	}
	
	console.log(c_acyclic);
	
	
	//最大になる向き付け
	let l_max_score/*: number*/ = Number.MIN_SAFE_INTEGER; //最高点
	let l_argmax_score/*: number*/ = null; //最高点の向き付け
	for (let i1 = 0; i1 < c_acyclic.length; i1++) {
		if (l_max_score <= c_acyclic[i1]["score"]) {
			l_max_score = c_acyclic[i1]["score"];
			l_argmax_score = c_acyclic[i1]["code"];
		}
	}
	
	//向き付け
	for (let i1 in c_graph_2["links"]) {
		c_graph_2["links"][i1]["direction"] = -1 + 2 * (Math.floor(l_argmax_score / (2 ** c_graph_2["links"][i1]["code"])) % 2); //-1か1
	}
	
	
	const c_link_array/*{
		"id": string; //辺id
		"direction": number; //向き（1か-1）
	}[]*/ = []; //最終的な並べ方
	//トポロジカルソート
	for (let i1 in c_graph_2["links"]) {
		f_add(i1);
		function f_add(a/*: string*/) {
			if (c_graph_2["links"][a]["add"] !== true) {
				c_graph_2["links"][a]["add"] = true;
				let l_next_node/*: string*/ = null;
				if (c_graph_2["links"][a]["direction"] === 1) {
					l_next_node = c_graph_2["links"][a]["tail"];
				} else if (c_graph_2["links"][a]["direction"] === -1) {
					l_next_node = c_graph_2["links"][a]["head"];
				}
				for (let i2 in c_graph_2["links"]) {
					if (c_graph_2["links"][i2]["head"] === l_next_node && c_graph_2["links"][i2]["direction"] === 1) {
						f_add(i2);
					} else if (c_graph_2["links"][i2]["tail"] === l_next_node && c_graph_2["links"][i2]["direction"] === -1) {
						f_add(i2);
					}
				}
				c_link_array.push({
					"id": a,
					"direction": -1 * c_graph_2["links"][a]["direction"]
				});
			}
		}
	}
	
	
	
	console.log(c_link_array);
	
	
	
	const c_node_array/*: string[]*/ = []; //節点idの配列
	for (let i1 = 0; i1 < c_link_array.length; i1++) {
		const c_ids/*: string*/ = c_link_array[i1]["id"].split("_");
		const c_direction/*: number*/ = c_link_array[i1]["direction"];
		if (c_direction === 1) {
			for (let i2 = 1; i2 < c_ids.length - 1; i2++) {
				c_node_array.push(c_ids[i2]);
			}
		} else if (c_direction === -1) {
			for (let i2 = c_ids.length - 2; i2 >= 1; i2--) {
				c_node_array.push(c_ids[i2]);
			}
		}
	}
	
	
	console.log(c_node_array);
	
	return c_node_array;
}