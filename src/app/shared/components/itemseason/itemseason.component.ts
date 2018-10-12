import {Component, Input, OnInit} from '@angular/core';


import RootObject = ItemSimpleListModule.RootObject;
import Item = ItemSimpleListModule.Item;
import {ItemListService} from "../../services/itemlist.service";


@Component({
  selector: 'app-itemseason',
  templateUrl: './itemseason.component.html',
})
export class ItemseasonComponent implements OnInit {

  public items: Item[];
  @Input() url: string;

  constructor(private itemListService: ItemListService) { }

  ngOnInit() {
    this.getItems();
  }

  getItems(){
    this.itemListService.getItems(this.url).subscribe(
      (data: RootObject) => { this.items = data._embedded.items},
      err => console.error(err),
      () => console.log('Season Loaded')
    );
  }

  getBackground(type){
    switch (type){
      case 'LEGENDARY':
        return 'http://localhost:8080/images/background/legendary.png';
      case 'EPIC':
        return 'http://localhost:8080/images/background/epic.png';
      case 'RARE':
        return 'http://localhost:8080/images/background/rare.png';
      case 'COMMON':
        return 'http://localhost:8080/images/background/common.png';
      case 'UNCOMMON':
        return 'http://localhost:8080/images/background/uncommon.png';
    }
  }
}
