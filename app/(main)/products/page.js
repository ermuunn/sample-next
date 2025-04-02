import Products from "@/components/product/Products"
import { notFound } from "next/navigation"
import { sendRequest } from "@/utils/request"

const title = "Бүтээгдэхүүнүүд - Датаком ХХК"
const description = "Датаком ХХК-д харгалзах бүтээгдэхүүнүүд"

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL),
  title: title,
  description: description,
  openGraph: {
      title: title,
      description: description,
  },
  twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
  },
}

export default async function ProductsPage(){
  const { data: products, error } = await sendRequest({ url: '/products', cache: false, auth: false })
  if(error) return notFound()
  return <Products products={products} />
}