import type { Schema, Struct } from '@strapi/strapi';

export interface LangSwitchNavlink extends Struct.ComponentSchema {
  collectionName: 'components_lang_switch_navlinks';
  info: {
    displayName: 'navlink';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface MapLocation extends Struct.ComponentSchema {
  collectionName: 'components_map_locations';
  info: {
    displayName: 'Location';
  };
  attributes: {
    Address: Schema.Attribute.String;
    latitude: Schema.Attribute.Decimal;
    longitude: Schema.Attribute.Decimal;
    Name: Schema.Attribute.String;
  };
}

export interface SliderAthlets extends Struct.ComponentSchema {
  collectionName: 'components_slider_athlets';
  info: {
    displayName: 'Athlets';
  };
  attributes: {
    FirstName: Schema.Attribute.String;
    LastName: Schema.Attribute.String;
    MiddleName: Schema.Attribute.String;
  };
}

export interface SliderCoaches extends Struct.ComponentSchema {
  collectionName: 'components_slider_coaches';
  info: {
    displayName: 'Coaches';
  };
  attributes: {
    Avatar: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    LastName: Schema.Attribute.String;
    MiddleName: Schema.Attribute.String;
    Name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'lang-switch.navlink': LangSwitchNavlink;
      'map.location': MapLocation;
      'slider.athlets': SliderAthlets;
      'slider.coaches': SliderCoaches;
    }
  }
}
