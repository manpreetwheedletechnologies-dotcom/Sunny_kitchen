import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UrbanPiperService {
  private readonly logger = new Logger(UrbanPiperService.name);

  constructor(private configService: ConfigService) {}

  async syncCatalog(products: any[]) {
    const apiKey = this.configService.get<string>("URBANPIPER_API_KEY");
    const username = this.configService.get<string>("URBANPIPER_USERNAME");
    const associationId = this.configService.get<string>("URBANPIPER_ASSOCIATION_ID");

    // Extract unique categories from products
    const categoryNames = Array.from(new Set(products.map((p) => p.category || "Uncategorized")));
    const categories = categoryNames.map((name) => ({
      ref_id: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: name,
      description: `${name} items from menu`,
    }));

    const items = products.map((p) => ({
      ref_id: String(p._id),
      title: p.name,
      description: p.ingredients || `${p.name} freshly made`,
      price: p.price,
      available: !p.outOfStock && p.stockCount > 0,
      category_ref_ids: [ (p.category || "Uncategorized").toLowerCase().replace(/[^a-z0-9]/g, "-") ],
      sold_at_store_level: true,
      translations: {},
    }));

    const payload = {
      categories,
      items,
      association_id: associationId,
    };

    // If active credentials aren't set, fallback to simulated success
    const isMock = !apiKey || apiKey.includes("api_key") || !username || username.includes("username");

    if (isMock) {
      this.logger.log(`[SIMULATED SYNC] Credentials not configured. Printing payload structure:`);
      this.logger.log(JSON.stringify(payload, null, 2));
      return {
        success: true,
        isSimulated: true,
        message: `Catalog sync simulated successfully. Pushed ${items.length} items across ${categories.length} categories to UrbanPiper hub (mock mode).`,
      };
    }

    try {
      this.logger.log(`[LIVE SYNC] Pushing catalog payload to UrbanPiper API for association ID: ${associationId}`);
      
      const response = await fetch("https://api.urbanpiper.com/hub/v1/metadata/catalog/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Apikey ${username}:${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || `HTTP error ${response.status}`);
      }

      return {
        success: true,
        isSimulated: false,
        message: `Catalog synced successfully in live mode. Pushed ${items.length} items to UrbanPiper.`,
        data: body,
      };
    } catch (err: any) {
      this.logger.error(`UrbanPiper API call failed: ${err.message}`);
      throw new Error(`UrbanPiper API catalog sync failed: ${err.message}`);
    }
  }
}
