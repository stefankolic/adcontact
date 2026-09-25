/**
 * Outlet rows with no Deutsch-dataset match whose part ALREADY has a page (and
 * a real photo) in the Magento catalogue. The outlet links to that existing
 * page instead of getting a duplicate own page, and the catalogue product page
 * shows the outlet price and Buy button for these products (see
 * CatalogueProductPage). Keyed by the outlet `sku`. `route` is the legacy
 * `/webshop/components/<type>/deutsch/...` URL (the one Google already knows);
 * `image` is the catalogue photo (640x480 today, so it falls under the same
 * 500x500 fix from 2027-01-31 as the rest of the catalogue images).
 * Generated 2026-09-25 from the catalogue snapshot; a row is only listed when
 * the catalogue product has a real (non-placeholder) image.
 */
export type OutletCatalogueLink = { productId: number; route: string; image: string };

export const OUTLET_CATALOGUE_PAGES: Record<string, OutletCatalogueLink> = {
  "240000-01": { productId: 3915, route: "/webshop/components/accessories/deutsch/1011-047-0605.html", image: "/media/catalog/product/1/0/1011-047-0605_2.jpg" }, // 1011-047-0605
  "240000-03": { productId: 3918, route: "/webshop/components/accessories/deutsch/1011-053-1205.html", image: "/media/catalog/product/1/0/1011-053-1205_1.jpg" }, // 1011-053-1205
  "240006-01": { productId: 3773, route: "/webshop/components/contacts/deutsch/1060-14-0122.html", image: "/media/catalog/product/t/e/te-reel_2.jpg" }, // 1060-14-0122
  "240006-09": { productId: 3774, route: "/webshop/components/contacts/deutsch/1060-14-0144.html", image: "/media/catalog/product/1/0/1060-14-0144.jpg" }, // 1060-14-0144
  "240025-01": { productId: 3746, route: "/webshop/components/contacts/deutsch/0460-229-16141.html", image: "/media/catalog/product/0/4/0460-229-16141_1.jpg" }, // 0460-229-16141
  "240027-01": { productId: 3754, route: "/webshop/components/contacts/deutsch/0460-256-12233.html", image: "/media/catalog/product/0/4/0460-256-12233_1.jpg" }, // 0460-256-12233
  "240034-09": { productId: 3767, route: "/webshop/components/contacts/deutsch/0462-210-1231.html", image: "/media/catalog/product/0/4/0462-210-1231_1.jpg" }, // 0462-210-1231
  "240035-01": { productId: 3762, route: "/webshop/components/contacts/deutsch/0462-203-04141.html", image: "/media/catalog/product/0/4/0462-203-04141_1.jpg" }, // 0462-203-04141
  "240039-09": { productId: 3769, route: "/webshop/components/contacts/deutsch/0462-221-1631.html", image: "/media/catalog/product/0/4/0462-221-1631_1.jpg" }, // 0462-221-1631
  "240040-09": { productId: 3753, route: "/webshop/components/contacts/deutsch/0460-247-1631.html", image: "/media/catalog/product/0/4/0460-247-1631_1.jpg" }, // 0460-247-1631 Au
  "240114-006": { productId: 4258, route: "/webshop/components/tools/deutsch/0411-353-0805.html", image: "/media/catalog/product/0/4/0411-353-0805.jpg" }, // 0411-353-0805 Removal tool size 8 green
  "240114-014": { productId: 4257, route: "/webshop/components/tools/deutsch/0411-337-1205.html", image: "/media/catalog/product/0/4/0411-337-1205_2.jpg" }, // 0411-337-1205 Removal tool size 12 orange
  "240114-028": { productId: 3840, route: "/webshop/components/accessories/deutsch/0413-214-1205.html", image: "/media/catalog/product/0/4/0413-214-1205_1.jpg" }, // 0413-214-1205 Keying Pin size 12 yellow
  "240114-032": { productId: 3842, route: "/webshop/components/accessories/deutsch/0413-216-2005.html", image: "/media/catalog/product/0/4/0413-216-2005_1.jpg" }, // 0413-216-2005 Keying Pin size 20 red
  "240115-041": { productId: 3844, route: "/webshop/components/accessories/deutsch/0421-203-04141.html", image: "/media/catalog/product/0/4/0421-203-04141.jpg" }, // 0421-203-04141 Crimp sleeve reducer size 4
  "242000-S02": { productId: 3890, route: "/webshop/components/accessories/deutsch/1010-009-0206.html", image: "/media/catalog/product/1/0/1010-009-0206.jpg" }, // 1010-009-0206 Front Seal DT06-2S
  "242000-S03": { productId: 3888, route: "/webshop/components/accessories/deutsch/1010-002-0306.html", image: "/media/catalog/product/1/0/1010-002-0306.jpg" }, // 1010-002-0306 Front Seal DT06-3S
  "242000-S06": { productId: 3892, route: "/webshop/components/accessories/deutsch/1010-017-0606.html", image: "/media/catalog/product/1/0/1010-017-0606.jpg" }, // 1010-017-0606 Front Seal DT06-6S
  "242000-S08": { productId: 3889, route: "/webshop/components/accessories/deutsch/1010-007-0806.html", image: "/media/catalog/product/1/0/1010-007-0806.jpg" }, // 1010-007-0806 Front Seal DT06-08SA
  "242000-S12": { productId: 3893, route: "/webshop/components/accessories/deutsch/1010-020-1206.html", image: "/media/catalog/product/1/0/1010-020-1206.jpg" }, // 1010-020-1206 Front Seal DT06-12SA
  "242003-131": { productId: 1917, route: "/webshop/components/accessories/deutsch/w3p-1939.html", image: "/media/catalog/product/W/3/W3P-1939.jpg" }, // W3P-1939
  "242004-0310": { productId: 3966, route: "/webshop/components/accessories/deutsch/1011-310-0205.html", image: "/media/catalog/product/1/0/1011-310-0205_1.jpg" }, // 1011-310-0205 Mounting Clip DT/DTM/DTP
  "242004-82": { productId: 3996, route: "/webshop/components/accessories/deutsch/1028-021-0205.html", image: "/media/catalog/product/1/0/1028-021-0205_1.jpg" }, // 1028-021-0205 Back Shell 180 DTM042P tie-wrap
  "242013-024": { productId: 1931, route: "/webshop/components/accessories/deutsch/w2sa-p012.html", image: "/media/catalog/product/W/2/W2SA-P012.jpg" }, // W2SA-P012
  "242100-20": { productId: 4410, route: "/webshop/components/tools/deutsch/dtt-16-00.html", image: "/media/catalog/product/D/T/DTT-16-00_1.jpg" }, // DTT-16-00 Hand tool
  "242113-024": { productId: 1859, route: "/webshop/components/accessories/deutsch/wm-2pb.html", image: "/media/catalog/product/W/M/WM-2PB.jpg" }, // WM-2PB
  "243000-040": { productId: 4084, route: "/webshop/components/accessories/deutsch/drc40-gkt.html", image: "/media/catalog/product/D/R/DRC40-GKT_1.jpg" }, // DRC 40-GKT
  "243000-070": { productId: 4086, route: "/webshop/components/accessories/deutsch/drc70-gkt.html", image: "/media/catalog/product/D/R/DRC70-GKT_1.jpg" }, // DRC 70-GKT
  "243026-5006": { productId: 2683, route: "/webshop/components/sealed-connectors/deutsch/drc26-50s06.html", image: "/media/catalog/product/D/R/DRC26-50S06_1.jpg" }, // DRC26-50-S06
  "243127-6090": { productId: 3876, route: "/webshop/components/accessories/deutsch/0528-002-6005.html", image: "/media/catalog/product/0/5/0528-002-6005_1.jpg" }, // 0528-002-6005
  "243130-7011": { productId: 3853, route: "/webshop/components/accessories/deutsch/0513-011-7006.html", image: "/media/catalog/product/0/5/0513-011-7006.jpg" }, // 0513-011-7006
  "243132-4091": { productId: 3868, route: "/webshop/components/accessories/deutsch/0515-015-4005.html", image: "/media/catalog/product/0/5/0515-015-4005_1.jpg" }, // 0515-015-4005
  "244000-005": { productId: 4167, route: "/webshop/components/accessories/deutsch/hd10-5-gkt.html", image: "/media/catalog/product/H/D/HD10-5-GKT_1.jpg" }, // HD10-5-GKT
  "244000-006": { productId: 4170, route: "/webshop/components/accessories/deutsch/hd10-6-gkt.html", image: "/media/catalog/product/H/D/HD10-6-GKT_1.jpg" }, // HD10-6-GKT
  "244031-01": { productId: 3834, route: "/webshop/components/accessories/deutsch/0409-201-2400.html", image: "/media/catalog/product/0/4/0409-201-2400_1.jpg" }, // 0409-201-2400
  "245016-030": { productId: 4190, route: "/webshop/components/accessories/deutsch/hdc16-3.html", image: "/media/catalog/product/H/D/HDC16-3_1.jpg" }, // HDC 16-3
  "245016-050": { productId: 4193, route: "/webshop/components/accessories/deutsch/hdc16-5.html", image: "/media/catalog/product/H/D/HDC16-5_1.jpg" }, // HDC 16-5
  "245018-003": { productId: 4174, route: "/webshop/components/accessories/deutsch/hd18-003.html", image: "/media/catalog/product/H/D/HD18-003_1.jpg" }, // HD 18-003
};
