import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(payload, signature, webhookSecret); }
  catch (err: any) { return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 }); }

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.metadata?.userId) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await supabase.from("subscriptions").upsert({
          user_id: session.metadata.userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price.id,
          plan: subscription.items.data[0]?.price.id === process.env.STRIPE_PRO_PRICE_ID ? "pro" : "enterprise",
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      await supabase.from("subscriptions").update({ status: subscription.status }).eq("stripe_subscription_id", subscription.id);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
