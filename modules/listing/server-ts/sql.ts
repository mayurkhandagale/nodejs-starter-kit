import { has } from 'lodash';
import { Model, raw } from 'objection';
import { camelizeKeys, decamelizeKeys, decamelize } from 'humps';

import { knex, returnId } from '@gqlapp/database-server-ts';
import { User } from '@gqlapp/user-server-ts/sql';

Model.knex(knex);

export interface Listing {
  userId: number;
  title: string;
  description: string;
  isActive: boolean;
  listingMedias: ListingMedia[];
  listingCost: ListingCost;
}

interface ListingMedia {
  listingId: number;
  url: string;
  isActive: boolean;
}

interface ListingCost {
  listingId: number;
  cost: number;
}

export interface Identifier {
  id: number;
}

const eager = '[user, listing_medias, listing_cost]';

export default class ListingDAO extends Model {
  private id: any;

  static get tableName() {
    return 'listing';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'listing.user_id',
          to: 'user.id'
        }
      },
      listing_medias: {
        relation: Model.HasManyRelation,
        modelClass: ListingMedia,
        join: {
          from: 'listing.id',
          to: 'listing_media.listing_id'
        }
      },
      listing_cost: {
        relation: Model.HasOneRelation,
        modelClass: ListingCost,
        join: {
          from: 'listing.id',
          to: 'listing_cost.listing_id'
        }
      },
      listing_bookmark: {
        relation: Model.BelongsToOneRelation,
        modelClass: ListingBookmark,
        join: {
          from: 'listing.id',
          to: 'listing_bookmark.listing_id'
        }
      }
    };
  }

  public async listingsPagination(limit: number, after: number, orderBy: any, filter: any) {
    const queryBuilder = ListingDAO.query().eager(eager);

    if (orderBy && orderBy.column) {
      const column = orderBy.column;
      let order = 'asc';
      if (orderBy.order) {
        order = orderBy.order;
      }

      queryBuilder.orderBy(decamelize(column), order);
    } else {
      queryBuilder.orderBy('id', 'desc');
    }

    if (filter) {
      if (has(filter, 'isActive') && filter.isActive !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_active', filter.isActive);
        });
      }
      if (has(filter, 'isFeatured') && filter.isFeatured !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_featured', filter.isFeatured);
        });
      }
      if (has(filter, 'isNew') && filter.isNew !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_new', filter.isNew);
        });
      }
      if (has(filter, 'isDiscount') && filter.isDiscount !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_discount', filter.isDiscount);
        });
      }

      if (has(filter, 'userId') && filter.userId !== '') {
        queryBuilder.where(function() {
          this.where('user.id', filter.userId);
        });
      }

      if (has(filter, 'lowerCost') && filter.lowerCost !== 0) {
        queryBuilder.where(function() {
          this.where('listing_cost.cost', '>', filter.lowerCost);
        });
      }

      if (has(filter, 'upperCost') && filter.upperCost !== 0) {
        queryBuilder.where(function() {
          this.where('listing_cost.cost', '<', filter.upperCost);
        });
      }

      if (has(filter, 'searchText') && filter.searchText !== '') {
        queryBuilder.where(function() {
          this.where(raw('LOWER(??) LIKE LOWER(?)', ['description', `%${filter.searchText}%`]))
            .orWhere(raw('LOWER(??) LIKE LOWER(?)', ['title', `%${filter.searchText}%`]))
            .orWhere(raw('LOWER(??) LIKE LOWER(?)', ['user.username', `%${filter.searchText}%`]))
            .orWhere(raw('LOWER(??) LIKE LOWER(?)', ['listing_cost.cost', `%${filter.searchText}%`]));
        });
      }
    }

    const rangeQueryBuilder = ListingDAO.query();

    const maxCost = camelizeKeys(
      await rangeQueryBuilder
        .from('listing')
        .leftJoin('listing_cost AS list_cost', 'list_cost.listing_id', 'listing.id')
        .max('list_cost.cost as var')
        .first()
    );

    const minCost = camelizeKeys(
      await rangeQueryBuilder
        .from('listing')
        .leftJoin('listing_cost AS list_cost1', 'list_cost1.listing_id', 'listing.id')
        .min('list_cost1.cost as var')
        .first()
    );

    queryBuilder
      .from('listing')
      .leftJoin('user', 'user.id', 'listing.user_id')
      .leftJoin('listing_cost', 'listing_cost.listing_id', 'listing.id');

    const allListings = camelizeKeys(await queryBuilder);
    const total = allListings.length;
    const res = camelizeKeys(await queryBuilder.limit(limit).offset(after));
    // console.log(res);
    return {
      listings: res,
      total,
      rangeValues: {
        maxCost: maxCost.var,
        minCost: minCost.var
      }
    };
  }

  public async listing(id: number) {
    const res = camelizeKeys(
      await ListingDAO.query()
        .findById(id)
        .eager(eager)
        .orderBy('id', 'desc')
    );
    // console.log(query[0]);
    return res;
  }

  public async addListing(params: Listing) {
    const res = await ListingDAO.query().insertGraph(decamelizeKeys(params));
    return res.id;
  }

  public async editListing(params: Listing & Identifier) {
    const res = await ListingDAO.query().upsertGraph(decamelizeKeys(params));
    return res.id;
  }

  public deleteListing(id: number) {
    return knex('listing')
      .where('id', '=', id)
      .del();
  }

  public async myListingBookmark(userId: number, limit: number, after: number, orderBy: any, filter: any) {
    const queryBuilder = ListingBookmark.query()
      .where('user_id', userId)
      .eager('[listing.[user, listing_medias, listing_cost]]');
    if (orderBy && orderBy.column) {
      const column = orderBy.column;
      let order = 'asc';
      if (orderBy.order) {
        order = orderBy.order;
      }

      queryBuilder.orderBy(decamelize(column), order);
    } else {
      queryBuilder.orderBy('id', 'desc');
    }

    if (filter) {
      if (has(filter, 'isActive') && filter.isActive !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_active', filter.isActive);
        });
      }
      if (has(filter, 'isFeatured') && filter.isFeatured !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_featured', filter.isFeatured);
        });
      }
      if (has(filter, 'isNew') && filter.isNew !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_new', filter.isNew);
        });
      }
      if (has(filter, 'isDiscount') && filter.isDiscount !== '') {
        queryBuilder.where(function() {
          this.where('listing.is_discount', filter.isDiscount);
        });
      }

      if (has(filter, 'userId') && filter.userId !== '') {
        queryBuilder.where(function() {
          this.where('user.id', filter.userId);
        });
      }

      if (has(filter, 'lowerCost') && filter.lowerCost !== 0) {
        queryBuilder.where(function() {
          this.where('listing_cost.cost', '>', filter.lowerCost);
        });
      }

      if (has(filter, 'upperCost') && filter.upperCost !== 0) {
        queryBuilder.where(function() {
          this.where('listing_cost.cost', '<', filter.upperCost);
        });
      }

      if (has(filter, 'searchText') && filter.searchText !== '') {
        queryBuilder.where(function() {
          this.where(raw('LOWER(??) LIKE LOWER(?)', ['description', `%${filter.searchText}%`]))
            .orWhere(raw('LOWER(??) LIKE LOWER(?)', ['title', `%${filter.searchText}%`]))
            .orWhere(raw('LOWER(??) LIKE LOWER(?)', ['user.username', `%${filter.searchText}%`]))
            .orWhere(raw('LOWER(??) LIKE LOWER(?)', ['listing_cost.cost', `%${filter.searchText}%`]));
        });
      }
    }

    const rangeQueryBuilder = ListingBookmark.query().where('user_id', userId);

    const maxCost = camelizeKeys(
      await rangeQueryBuilder
        .from('listing_bookmark')
        .leftJoin('listing_cost AS list_cost', 'list_cost.listing_id', 'listing_bookmark.listing_id')
        .max('list_cost.cost as var')
        .first()
    );

    const minCost = camelizeKeys(
      await rangeQueryBuilder
        .from('listing_bookmark')
        .leftJoin('listing_cost AS list_cost1', 'list_cost1.listing_id', 'listing_bookmark.listing_id')
        .min('list_cost1.cost as var')
        .first()
    );

    queryBuilder
      .from('listing_bookmark')
      .leftJoin('user', 'user.id', 'listing_bookmark.user_id')
      .leftJoin('listing_cost', 'listing_cost.listing_id', 'listing_bookmark.listing_id');

    const res = camelizeKeys(await queryBuilder.limit(limit).offset(after));

    const allListings = res.map(item => {
      return item.listing;
    });

    const total = allListings.length;
    return {
      listings: allListings,
      total,
      rangeValues: {
        maxCost: maxCost.var,
        minCost: minCost.var
      }
    };
  }

  public async listingBookmarkStatus(listingId: number, userId: number) {
    const count = camelizeKeys(
      await ListingBookmark.query()
        .where('user_id', userId)
        .where('listing_id', listingId)
    ).length;
    let wStatus = false;
    // console.log('count', count);
    if (count > 0) {
      wStatus = true;
    }
    return wStatus;
  }

  public async addOrRemoveListingBookmark(listingId: number, userId: number) {
    const status = await this.listingBookmarkStatus(listingId, userId);
    // console.log('status1', status);
    if (status) {
      await ListingBookmark.query()
        .where('listing_id', '=', listingId)
        .andWhere('user_id', '=', userId)
        .del();
      return false;
    } else {
      await ListingBookmark.query().insertGraph(decamelizeKeys({ listingId, userId }));
      return true;
    }
  }
}

// ListingMedia model.
class ListingMedia extends Model {
  static get tableName() {
    return 'listing_media';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ListingDAO,
        join: {
          from: 'listing_media.listing_id',
          to: 'listing.id'
        }
      }
    };
  }
}

// ListingCost model.
class ListingCost extends Model {
  static get tableName() {
    return 'listing_cost';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ListingDAO,
        join: {
          from: 'listing_cost.listing_id',
          to: 'listing.id'
        }
      }
    };
  }
}

// ListingBookmark model.
class ListingBookmark extends Model {
  static get tableName() {
    return 'listing_bookmark';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ListingDAO,
        join: {
          from: 'listing_bookmark.listing_id',
          to: 'listing.id'
        }
      }
    };
  }
}
