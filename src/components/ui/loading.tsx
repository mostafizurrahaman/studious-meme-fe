// const Loading = () => {
//   return (
//     <div className="h-screen w-full flex justify-center items-center">
//       <div className="spinner">
//         <div />
//         <div />
//         <div />
//         <div />
//         <div />
//         {/* <div /> */}
//       </div>
//     </div>
//   );
// };

// export default Loading;

const Loading = () => {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-card/95 px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <div className="size-6 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
        </div>
        <div className="mt-5 space-y-2" aria-hidden="true">
          <div className="mx-auto h-3 w-3/4 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full animate-pulse rounded-full bg-primary/35" />
          </div>
          <div className="mx-auto h-2 w-1/2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full animate-pulse rounded-full bg-primary/25" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
