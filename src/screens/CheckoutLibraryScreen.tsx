import { Card, ScreenTitle } from "../components/ui";
import { getRouteForFinish } from "../utils/checkoutRoutes";

export function CheckoutLibraryScreen({ onBack }: { onBack: () => void }) {
  const common = [41, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 170];
  return (
    <div className="screen">
      <ScreenTitle title="Checkout Library" subtitle="Light MVP route reference." onBack={onBack} />
      <Card>
        <p className="muted">
          This first version includes common route lines and is designed to grow in later versions.
        </p>
        <div className="breakdown-list">
          {common.map((finish) => {
            const route = getRouteForFinish(finish, "D16");
            return (
              <div key={finish} className="breakdown-item">
                <span>{finish}</span>
                <span>{route.route}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
