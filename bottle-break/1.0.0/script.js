class Bottle {
  constructor (i, imgpat, len) {
    this.id = i
    this.srcPattern = imgpat
    this.len = len
  }
}
class Clicker {
	constructor (name, dpc, opt={}) {
		this.id = name
		this.dpc = dpc
		this.buy = opt.buy ? {
			price: opt.buy.price || 100
		} : false
		this.trait = opt.trait || false
		this.description = opt.description
	}
	buyClicker () {
		this.buy = "buyed"
		return this
	}
}
class Gadget {
	constructor (name, opt={}) {
		this.id = name
		this.buy = opt.buy ? {
			price: opt.buy.price || 100
		} : false
		this.trait = opt.trait || false
		this.description = opt.description
    this.cover = opt.cover
    this.coverTO = opt.coverTO
	}
	buyGadget () {
		this.buy = "buyed"
		return this
	}
}
class Game {
  constructor() {
    this.bottle = new Bottle("bottle", "https://cdn.keikun1215.cf/assets/bbreak/bottle/bottle_{n}.webp", 4)
    this.image = this.bottle.srcPattern.replace(/\{n\}/g, "0")
    this.elem = mainimg
    this.cover = cover
    this.mess = mess
		this.clshop = clickers
    this.gtshop = gadgets
    this.clicked = 0
    this.break = 6666
		this.clicker = new Clicker("デフォルト", 1)
		this.clickers = [
			new Clicker("デフォルト", 1),
			new Clicker("パンチ", 2, {
				buy: {
					price: 5
				}
			}),
			new Clicker("自動採掘", 2, {
				description: "自動でボトルを破壊する。0.5秒に1クリック分を自動で行う。威力はパンチと同じ。",
				buy: {
					price: 20
				},
				trait: {
					autoClick: {
						ms: 500,
						click: 1
					}
				}
			}),
			new Clicker("最強", 666, {
				description: "超☆最強",
				buy: {
					price: 6666
				},
				trait: {
					autoClick: {
						ms: 1,
						click: 3
					}
				}
			})
		]
    this.gadgets = [
      new Gadget("軌道衛星", {
        description: "30秒毎に軌道からレーザーを発射\n一回で2000回破壊される",
        cover: "https://cdn.keikun1215.cf/assets/bbreak/gadget/satellite.webp",
        coverTO: 1500,
				trait: {
					autoClick: {
						ms: 30000,
						break: 2000
					}
				},
        buy: {
          price: 3000
        }
      })
    ]
    this.dpc = 1
    this.elem.onclick = () => {
      this.clicked += this.dpc
      if ((this.clicked == 0 ? 1 : this.clicked) % this.bottle.len + 1 == 0) {
        this.clicked = 0
      } else if (this.clicked == this.bottle.len+1) {
        this.clicked -= this.bottle.len
        this.break++
				this.onbreak()
      } else if (this.clicked > this.bottle.len+1) {
        this.break++
        this.clicked -= this.bottle.len
        while (this.clicked > this.bottle.len) {
          this.break++
          this.clicked -= this.bottle.len
        }
				this.onbreak()
      }
			this.image = this.bottle.srcPattern.replace(/\{n\}/g, this.clicked)
      this.update()
    }
    this.mess.textContent = "Bottle breaks: 0"
		this.onbreak()
  }
	aclick (a=this.dpc) {
    this.clicked += a
    if ((this.clicked == 0 ? 1 : this.clicked) % this.bottle.len + 1 == 0) {
      this.clicked = 0
    } else if (this.clicked == this.bottle.len+1) {
      this.clicked -= this.bottle.len
      this.break++
			this.onbreak()
    } else if (this.clicked > this.bottle.len+1) {
      this.break++
      this.clicked -= this.bottle.len
      while (this.clicked > this.bottle.len) {
        this.break++
        this.clicked -= this.bottle.len
				console.log(this.clicked)
      }
			this.onbreak()
    }
		this.image = this.bottle.srcPattern.replace(/\{n\}/g, this.clicked)
    this.update()
  }
	toJSON (t, download=false) {
		let json = {
			clickers: this.clickers.map(v=>{
				return {
					id: v.id,
					buyed: v.buy === false ? true : v.buy == "buyed" ? "buyed" : false
				}
			}),
			clicker: this.clicker.id,
			clicked: this.clicked,
			breaks: this.break,
			bottle: this.bottle.id
		}
		if (download) {
			const a = document.createElement('a')
			a.href = URL.createObjectURL(new Blob([JSON.stringify(json, "", "  ")],{type: "application/json"}))
			a.download = 'data.json';
			a.click()
		}
		return t.toLowerCase() == "string" ? JSON.stringify(json, "", "  ") : json
	}
	loadFileAsJSON (file) {
		let fr = new FileReader()
		fr.readAsText(file)
		fr.onload = () => {
			console.log(fr.result)
			this.loadJSON(fr.result)
		}
	}
	loadJSON (json) {
		let data = JSON.parse(json)
		this.break = data.breaks
		this.clicked = data.clicked
		this.clickers = this.clickers.map((c,i)=>{
			switch (data.clickers.find(b=>b.id==c.id).buyed) {
				case "buyed":
					c.buyClicker()
					break
				case true:
					c.buy = false
					break
				case false:
					break
			}
			return c
		})
		this.update()
	}
  main() {
    this.update()
  }
  update() {
    this.elem.src = this.image
    this.mess.textContent = `Bottle breaks: ${this.break}`
    this.onbreak()
	}
  setCover (u = "", x = 0, y = 0, h = 256, w = 256) {
    this.cover.src = u
    this.cover.style.top = y
    this.cover.style.left = x
    this.cover.style.height = h
    this.cover.style.width = w
  }
	changeClicker (cl) {
		this.clicker = cl
		this.dpc = cl.dpc
	}
	useClicker (id) {
		let clicker = this.clickers.find(c=>c.id==id)
		this.changeClicker(clicker)
		clearInterval(this.autoClickIntervalId)
		if (clicker.trait) {
			if (clicker.trait.autoClick) {
				this.autoClickIntervalId = setInterval(()=>{
          if (clicker.trait.autoClick.break) this.break += this.clickers.find(c=>c.id==id).trait.autoClick.break
					if (clicker.trait.autoClick.click) this.aclick(this.clickers.find(c=>c.id==id).trait.autoClick.click)
					this.update()
				}, clicker.trait.autoClick.ms || 1000)
			}
		}
		this.update()
	}
	buyClicker (id) {
		this.break -= this.clickers.find(c=>c.id==id).buy.price
		this.clickers.find(c=>c.id==id).buyClicker()
		this.update()
	}
  changeGadget (gadget) {
		this.gadget = gadget
	}
	useGadget (id) {
		let gadget = this.gadgets.find(c=>c.id==id)
		this.changeGadget(gadget)
		clearInterval(this.GautoClickIntervalId)
		if (gadget.trait) {
			if (gadget.trait.autoClick) {
				this.GautoClickIntervalId = setInterval(()=>{
          if (gadget.cover) {
            this.setCover(gadget.cover)
            setTimeout(()=>{
              console.log("aaa")
              this.setCover("https://cdn.keikun1215.cf/assets/transparent.webp")
            }, gadget.coverTO)
          }
					if (gadget.trait.autoClick.break) this.break += this.gadgets.find(c=>c.id==id).trait.autoClick.break
					if (gadget.trait.autoClick.click) this.aclick(this.gadgets.find(c=>c.id==id).trait.autoClick.click)
					this.update()
				}, gadget.trait.autoClick.ms || 1000)
			}
		}
		this.update()
	}
	buyGadget (id) {
		this.break -= this.gadgets.find(c=>c.id==id).buy.price
		this.gadgets.find(c=>c.id==id).buyGadget()
		this.update()
	}
	onbreak() {
		this.clshop.innerHTML = this.clickers.map(c=>{
			return `
<div class="clshelem">
  <b>${c.id}</b>${this.clicker == c ? "<span class=\"used\">used</span>" : ""}<br>
	${c.description ? `<div class="descr">${c.description.replace(/\n/g, "<br>")}</div>` : ""}
	${c.buy ? c.buy == "buyed" ? "Useable" : `Price: ${c.buy.price} breaks` : "Free"}<br>
	DPC: ${c.dpc}<br>
  ${c.buy == "buyed" ? `<button onclick="game.useClicker('${c.id}')">USE</button>` : c.buy ? c.buy.price <= this.break ? `<button onclick="game.buyClicker('${c.id}')">Buy</button>` : `<button disabled>Buy</button>` : `<button onclick="game.useClicker('${c.id}')">USE</button>`}
</div>
`
		}).join("")
    this.gtshop.innerHTML = this.gadgets.map(c=>{
			return `
<div class="clshelem">
  <b>${c.id}</b>${this.gadget == c ? "<span class=\"used\">used</span>" : ""}<br>
	${c.description ? `<div class="descr">${c.description.replace(/\n/g, "<br>")}</div>` : ""}
	${c.buy ? c.buy == "buyed" ? "Useable" : `Price: ${c.buy.price} breaks` : "Free"}<br>
  ${c.buy == "buyed" ? `<button onclick="game.useGadget('${c.id}')">USE</button>` : c.buy ? c.buy.price <= this.break ? `<button onclick="game.buyGadget('${c.id}')">Buy</button>` : `<button disabled>Buy</button>` : `<button onclick="game.useGadget('${c.id}')">USE</button>`}
</div>
`
		}).join("")
	}
}
const game = new Game()
game.main()
