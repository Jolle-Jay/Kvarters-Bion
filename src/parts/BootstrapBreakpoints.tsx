// show boostrap-breakpoints
// for debugging purposes during development
export default function ShowBootstrapBreakPoints() {
  const points = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];  
  // const points = Bootstrap baserar dessa på skärmarnas bredd i pixlar
  return <aside className="bootstrap-breakpoints">
    {points.map((size, i) => (
      <div key={i} className={
        (size === 'xs' ? 'd-block ' : 'd-none d-' + size + '-block ')
        + (points[i + 1] ? 'd-' + points[i + 1] + '-none' : '')
      }>
        {size}
      </div>
    ))}
  </aside>;
}

// visar textremsa md, lg längst upp på sidan av skärmen
//När man ändrar på webbläsarfönstret uppdateras texten auto för nuvarande Bootstrap

