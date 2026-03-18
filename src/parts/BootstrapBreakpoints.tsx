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

// Displays a text banner for md and lg at the top of the screen
// When the browser window is resized, the text updates automatically based on the current Bootstrap breakpoint