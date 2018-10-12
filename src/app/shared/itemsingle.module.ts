declare module ItemSingleModule {

    export interface Obtained {
      season: number;
      tier: number;
      promo: string;
      includedInName: string;
      vbuckPrice: number;
      price: number;
      challenge: string;
    }

    export interface Self {
      href: string;
    }

    export interface Item {
      href: string;
      templated: boolean;
    }

    export interface Links {
      self: Self;
      item: Item;
    }

    export interface RootObject {
      id: string;
      name: string;
      desc: string;
      rarityType: string;
      images: string[];
      obtained: Obtained;
      styleSet: string;
      set: string;
      itemType: string;
      status: string;
      _links: Links;
    }

  }

