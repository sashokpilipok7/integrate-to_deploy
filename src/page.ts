// enable experimentalDecorators in tsconfig.json

import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional
} from 'class-validator';


export default class Page {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name: string;


  content: string;
  site: string;
  
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  slug: string;
  
  constructor(name: string, content: string, site: string, slug: string) {

    if (!slug) {
      throw new Error(`Invalid slug`);
    }

    if (name.length < 2 || name.length > 30) {
      throw new TypeError(`Invalid lenght for name: ${name}`);
    }

    if (slug.length < 1 || slug.length > 30) {
      throw new TypeError(`Invalid lenght for slug`);
    }

    this.name = name;
    this.content = content;
    this.site = site;
    this.slug = slug;
  }



  // constructor(name: string, content: string, site: string) {
  //   this.name = name;
  //   this.content = content;
  //   this.site = site;
  // }
}