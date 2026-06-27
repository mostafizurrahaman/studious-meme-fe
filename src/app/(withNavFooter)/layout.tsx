import { Suspense } from 'react';
import { FloatingCategoryRail } from '@/components/FloatingCategoryRail';
import { Footer } from '@/components/Footer';
import { MobileToolbar } from '@/components/MobileToolbar';
import { Container } from '@/components/Container';
import { StorefrontHeader } from '@/components/StorefrontHeader';
import { StorefrontFloatingContact } from '@/components/StorefrontFloatingContact';
import Loading from './loading';
import {
  getActiveBrands,
  mapBackendBrandToStorefrontBrand,
} from '@/services/Brand';
import { getActiveCategories } from '@/services/Category';
import {
  mapBackendCategoryToStorefrontCategory,
  type BackendCategory,
} from '@/services/Category/mappers';

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const [categoriesResult, brandsResult] = await Promise.all([
    getActiveCategories().catch(() => null),
    getActiveBrands().catch(() => null),
  ]);

  const categories = Array.isArray(categoriesResult?.data)
    ? categoriesResult.data.map((item) =>
        mapBackendCategoryToStorefrontCategory(item as BackendCategory),
      )
    : // .slice(0, 12)
      [];

  const brands = brandsResult?.data?.length
    ? await Promise.all(
        brandsResult.data.slice(0, 200).map(mapBackendBrandToStorefrontBrand),
      )
    : [];

  return (
    <div>
      <StorefrontHeader categories={categories.slice(0, 14)} />
      <main
        style={{
          paddingTop:
            'var(--storefront-header-height, clamp(120px, 12vw, 160px))',
        }}
      >
        <FloatingCategoryRail categories={categories.slice(0, 12)} />
        <div className="lg:pl-18 2xl:pl-0">
          <Container>
            <div className="min-h-screen">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </div>
          </Container>
        </div>
      </main>
      <Footer categories={categories} brands={brands} />
      <MobileToolbar />
      <StorefrontFloatingContact />
    </div>
  );
};

export default MainLayout;
