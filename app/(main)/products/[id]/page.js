import ProductDetail from "@/components/product/ProductDetail"
import { sendRequest } from "@/utils/request"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }){
  const { id } = params
  if(!id) return
  const { data: product, error } = await sendRequest({ url: `/product/${id}`, cache: false, auth: false })
  if(error) return
  let data = { title: `${product.name} - Датаком ХХК` }
  if(product.description) data.description = product.description
  return data
}

export default async function ProductDetailPage({ params }){
  const { id } = params
  if(!id) return notFound()
  const { data: product, error } = await sendRequest({ url: `/product/${id}`, cache: false, auth: false })
  if(error) return notFound()
  return <ProductDetail product={product} />
}