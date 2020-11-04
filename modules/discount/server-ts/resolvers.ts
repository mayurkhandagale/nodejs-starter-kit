import { Discount as Discounts, Identifier } from './sql';
import withAuth from 'graphql-auth';
import schedule from 'node-schedule';

import { ORDER_STATES } from '@gqlapp/order-common';
import { ORDER_SUBSCRIPTION, ORDERS_SUBSCRIPTION } from '@gqlapp/order-server-ts/resolvers';

interface Edges {
  cursor: number;
  node: Discounts & Identifier;
}

interface DiscountInput {
  input: Discounts;
}

interface DiscountInputWithId {
  input: Discounts & Identifier;
}

export default (pubsub: any) => ({
  Query: {
    async discounts(obj: any, { limit, after, orderBy, filter }: any, { Discount, req: { identity } }: any) {
      const edgesArray: Edges[] = [];
      const { total, discounts } = await Discount.discountsPagination(limit, after, orderBy, filter);

      const hasNextPage = total > after + limit;

      discounts.map((discount: Discounts & Identifier, index: number) => {
        edgesArray.push({
          cursor: after + index,
          node: discount
        });
      });
      const endCursor = edgesArray.length > 0 ? edgesArray[edgesArray.length - 1].cursor : 0;

      return {
        totalCount: total,
        edges: edgesArray,
        pageInfo: {
          endCursor,
          hasNextPage
        }
      };
    },
    async discount(obj: any, { id }: Identifier, { Discount }: any) {
      return Discount.discount(id);
    },
    async modalDiscount(obj: any, { modalName, modalId }: { modalName: string; modalId: number }, { Discount }: any) {
      return Discount.modalDiscount(modalName, modalId);
    }
  },
  Mutation: {
    addDiscount: withAuth(async (obj: any, { input }: DiscountInput, { Discount, Order, Listing }: any) => {
      try {
        const res = await Discount.addDiscount(input);
        // const discount = await Discount.discount(id);
        // // publish for discount list
        // pubsub.publish(DISCOUNTS_SUBSCRIPTION, {
        //   discountUpdated: {
        //     mutation: 'CREATED',
        //     id,
        //     node: discount
        //   }
        // });
        if (res) {
          schedule.scheduleJob(res.discountDuration.endDate, async () => {
            // console.log('job initialed', res.discountDuration.endDate);
            const filter = { state: ORDER_STATES.STALE };
            const orders = await Order.orders({}, filter);
            Promise.all(
              orders.map(async order => {
                await Promise.all(
                  order.orderDetails.map(async ordDtl => {
                    if (
                      res.modalName === 'listing' &&
                      ordDtl.modalName === 'listing' &&
                      ordDtl.modalId === res.modalId
                    ) {
                      const listing = await Listing.listing(ordDtl.modalId);
                      const cost = listing.listingCostArray[0].cost;
                      // tslint:disable-next-line:radix
                      await Order.editOrderDetail({ id: ordDtl.id, listingCost: parseInt(cost.toFixed(2)) });
                      await Discount.deleteDiscount(res.id);
                    }
                  })
                );
                const newOrder = await Order.order(order.id);
                pubsub.publish(ORDERS_SUBSCRIPTION, {
                  ordersUpdated: {
                    mutation: 'UPDATED',
                    node: newOrder
                  }
                });
                pubsub.publish(ORDER_SUBSCRIPTION, {
                  orderUpdated: {
                    mutation: 'UPDATED',
                    id: newOrder.id,
                    node: newOrder
                  }
                });
              })
            );
          });
        }
        return true;
      } catch (e) {
        return e;
      }
    }),
    editDiscount: withAuth(async (obj: any, { input }: DiscountInputWithId, context: any) => {
      try {
        await context.Discount.editDiscount(input);
        // const discount = await context.Discount.discount(input.id);
        // // publish for discount list
        // pubsub.publish(DISCOUNT_SUBSCRIPTION, {
        //   discountsUpdated: {
        //     mutation: 'UPDATED',
        //     id: discount.id,
        //     node: discount
        //   }
        // });
        // // publish for edit discount page
        // pubsub.publish(DISCOUNT_SUBSCRIPTION, {
        //   discountUpdated: {
        //     mutation: 'UPDATED',
        //     id: discount.id,
        //     node: discount
        //   }
        // });
        return true;
      } catch (e) {
        return e;
      }
    }),
    deleteDiscount: withAuth(async (obj: any, { id }: Identifier, context: any) => {
      // const discount = await context.Discount.discount(id);
      const isDeleted = await context.Discount.deleteDiscount(id);
      if (isDeleted) {
        //   // publish for discount list
        //   pubsub.publish(DISCOUNTS_SUBSCRIPTION, {
        //     discountsUpdated: {
        //       mutation: 'DELETED',
        //       id,
        //       node: discount
        //     }
        //   });
        //   // publish for edit discount page
        //   pubsub.publish(DISCOUNT_SUBSCRIPTION, {
        //     discountUpdated: {
        //       mutation: 'DELETED',
        //       id, // import { ONSHELF, ONRENT } from "../common/constants/DiscountStates";
        //       node: discount
        //     }
        // });
        return true;
      } else {
        return false;
      }
    })
  },
  Subscription: {}
});
